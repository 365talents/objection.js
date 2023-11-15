import { Person } from '../fixtures/person';
import { ModelObject } from '../../../typings/objection';

const takesPersonPojo = (person: ModelObject<Person>) => true;

const person = Person.fromJson({ firstName: 'Jennifer' });
const personPojo = person.toJSON();
(async () => {
  const p = await Person.query().withGraphFetched({
    mom: {
      mom: true
    },
    pet: true
  }).first();
  if(p) {
    const pj = p.toJSON();
    // test that toJSON keeps the required properties
    pj.pet;
    pj.mom.mom.children?.at(0)?.lastName;
    // @ts-expect-error test that toJSON works
    pj.$fetchGraph;
    // @ts-expect-error test that toJSON works recursively
    pj.mom.$fetchGraph;
  }

});

takesPersonPojo(personPojo);
