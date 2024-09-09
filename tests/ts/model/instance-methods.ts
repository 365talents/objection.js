import { Person } from '../fixtures/person';
import { ModelObject } from '../../../typings/objection';

const takesPersonPojo = (person: ModelObject<Person>) => true;

const person = Person.fromJson({ firstName: 'Jennifer', mom: { firstName: 'Jane' }, dad: { firstName: 'John' }, sister: { firstName: 'Lola' } });
const personPojo = person.toJSON();

takesPersonPojo(personPojo);

// @ts-expect-error
personPojo.mom?.$afterDelete;
// toJSON keeps optionality
personPojo.mom = undefined;

// toJSON keeps null types
personPojo.sister = null;

// @ts-expect-error dad is not nullable
personPojo.dad = null;
// @ts-expect-error dad is not undefinable
personPojo.dad = undefined;
// @ts-expect-error toJSON works on normal properties
personPojo.dad.$afterDelete;



const shallowPerson = person.toJSON({ shallow: true });
// shallow toJSON keeps related models as ModelObject
shallowPerson.mom?.$afterDelete;
