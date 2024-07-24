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
  });

  const p = await pq;
  pq.ModelType.pet;
  if(p) {
    const pj = p[0].toJSON();
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

(async () => {
  const p = await Person.query().withGraphFetched({
    mom: {
      mom: true
    },
    pet: true
  }).whereIn('id', [12,11,14]).ignore().first();

  if(p) {
    //const pj = p[0].blurb();
    // test that toJSON keeps the required properties
    p.pet.id;
    p.mom;
    // @ts-expect-error test that toJSON works
    p.movies.at(0);
    p.mom.mom.children?.at(0)?.lastName;
  }

});

takesPersonPojo(personPojo);
