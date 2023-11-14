import { Person } from '../fixtures/person';

(async () => {
  await Person.query().withGraphFetched('pets');

  await Person.query().withGraphFetched('[pets, children.[pets, children]]');

  await Person.query().withGraphFetched({
    pets: true,
    children: {
      pets: true,
      children: true,
    },
  });

  // @ts-expect-error property foo does not exist
  await Person.query().withGraphFetched({
    foo: true,
    children: {
      pets: true,
      children: true,
    },
  });

  const personWithPets = await Person.query().withGraphFetched({
    pet: true,
    children: {
      pets: true,
      children: true,
    },
  }).first();

  if(personWithPets) {
    personWithPets.pet;
    personWithPets.pet.name;
    // @ts-expect-error mom was not fetched
    personWithPets.mom.lastName;
    personWithPets.children;
    personWithPets.children.at(0);
    personWithPets.children.at(0)?.children;
    personWithPets.children.at(0)?.children.at(0);
  }

  const personWithMom = await Person.query().withGraphFetched({
    mom: {
      mom: true,
      children: true,
    },
  }).first();
  if(personWithMom){
    personWithMom.mom.lastName;
    personWithMom.mom.mom.lastName;
    // @ts-expect-error pet was not fetched
    personWithMom.mom.mom.pet.name;
    // @ts-expect-error mom was not fetched
    personWithMom.mom.mom.mom.lastName;
  }

  const personAlone = await Person.query().first();
  if(personAlone){
    // @ts-expect-error we didnt fetch pet
    personAlone.pet.name;
  }

  const personWitModifier = await Person.query().withGraphFetched({
    mom: {
      $modify: ['selectAll'],
      mom: {
        pet: true,
      }
    },
  }).first();
  if(personWitModifier){
    personWitModifier.mom.mom.pet.name;
    // @ts-expect-error
    personWitModifier.mom['$modify'];
  }

  await Person.query().withGraphFetched('[pets, children.^]');

  await Person.query().withGraphFetched('[pets, children.^3]');

  await Person.query()
    .withGraphFetched('[children.[pets, movies], movies]')
    .modifyGraph('children.pets', (builder) => {
      // Only select pets older than 10 years old for children
      // and only return their names.
      builder.where('age', '>', 10).select('name');
    });

  await Person.query()
    .withGraphFetched('[pets(selectName, onlyDogs), children(orderByAge).[pets, children]]')
    .modifiers({
      selectName: (builder) => {
        builder.select('name');
      },
      orderByAge: (builder) => {
        builder.orderBy('age');
      },
      onlyDogs: (builder) => {
        builder.where('species', 'dog');
      },
    });

  await Person.query().withGraphFetched(`
    children(defaultSelects, orderByAge).[
      pets(onlyDogs, orderByName),
      movies
    ]
  `);

  await Person.query().withGraphFetched(`[
    children(orderByAge) as kids .[
      pets(filterDogs) as dogs,
      pets(filterCats) as cats

      movies.[
        actors
      ]
    ]
  ]`);

  const eager = `[]`;
  await Person.query().allowGraph('[pets, children.pets]').withGraphFetched(eager);

  await Person.query().withGraphFetched('[pets, children.pets]');

  await Person.query().withGraphJoined('[pets, children.pets]');

  const withRelations = await Person.query().withGraphFetched({
    pets: true,
    children: {
      pets: true,
      children: true,
    },
  });

  // no error as we ask for children in the withGraphFetched
  withRelations[0].children[0];

  // should have an error as we didn't ask for comments in the withGraphFetched
  // @ts-expect-error
  withRelations[0].comments[0]

})();
