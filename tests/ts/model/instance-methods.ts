import { Person } from '../fixtures/person';
import { ModelObject } from '../../../typings/objection';

const takesPersonPojo = (person: ModelObject<Person>) => true;

const person = Person.fromJson({ firstName: 'Jennifer' });
const personPojo = person.toJSON();
// @ts-expect-error toJSON should remove the base Model methods recursively even on arrays 
personPojo.children![0].$query

(async () => {
  const pq = Person.query().withGraphFetched({
    mom: {
      mom: true
    },
    pet: true
  });//.first();

  const p = await pq;
  if(p) {
    const pj = p[0].toJSON();
    //const pj = p[0].blurb();
    // test that toJSON keeps the required properties
    pj.pet.id;
    pj.mom;
    // @ts-expect-error test that toJSON works
    pj.movies.at(0);
    pj.mom.mom.children?.at(0)?.lastName;
    // @ts-expect-error test that toJSON works
    pj.$fetchGraph;
    // @ts-expect-error test that toJSON works recursively
    pj.mom.$fetchGraph;
  }

});

takesPersonPojo(personPojo);
