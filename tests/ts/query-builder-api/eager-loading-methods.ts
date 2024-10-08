import { Person } from '../fixtures/person';
import { Animal } from '../fixtures/animal';

(async () => {
  await Person.query().where('firstName', 'Arnold').withGraphFetched('pets');

  await Person.query().withGraphFetched('children.[pets, movies]');

  await Person.query().withGraphFetched({
    children: {
      pets: true,
      movies: true,
    },
  });

  await Person.query()
    .withGraphFetched('children(selectNameAndId).[pets(onlyDogs, orderByName), movies]')
    .modifiers({
      selectNameAndId(builder) {
        builder.select('name', 'id');
      },

      orderByName(builder) {
        builder.orderBy('name');
      },

      onlyDogs(builder) {
        builder.where('species', 'dog');
      },
    });

  await Person.query().modifiers({
    // You can bind arguments to Model modifiers like this
    filterFemale(builder) {
      // @ts-expect-error filterGender doesn't accept arguments
      builder.modify(Animal.modifiers.filterGender, 'female');
      
      builder.modify(Animal.modifiers.filterGender);
    },

    filterDogs(builder) {
      builder.modify(Animal.modifiers.filterSpecies, 'dog');

      // @ts-expect-error too many arguments
      builder.modify(Animal.modifiers.filterSpecies, 'dog', 'dog');

      // @ts-expect-error wrong argument type
      builder.modify(Animal.modifiers.filterSpecies, false);

      // @ts-expect-error not enough arguments
      builder.modify(Animal.modifiers.filterSpecies);
    },
  }).withGraphFetched(`
    children(defaultSelects, orderByAge, filterFemale).[
      pets(filterDogs, orderByName),
      movies
    ]
  `);

  await Person.query()
    .withGraphFetched('children.[pets, movies]')
    .modifyGraph('children', (builder) => {
      // Order children by age and only select id.
      builder.orderBy('age').select('id');
    })
    .modifyGraph('children.[pets, movies]', (builder) => {
      // Only select `pets` and `movies` whose id > 10 for the children.
      builder.where('id', '>', 10);
    });

  await Person.query().withGraphFetched(`[
    children(orderByAge) as kids .[
      pets(filterDogs) as dogs,
      pets(filterCats) as cats

      movies.[
        actors
      ]
    ]
  ]`);
  await Person.query().withGraphFetched({
    kids: {
      $relation: 'children',
      $modify: 'orderByAge',
      dogs: {
        $relation: 'pets',
        $modify: 'filterDogs',
      },
      cats: {
        $relation: 'pets',
        $modify: 'filterCats',
      },
      movies: {
        actors: true,
      },
    }
  });

  await Person.query().where('id', 1).withGraphFetched({ children : { children : true } });

  await Person.query()
    .withGraphJoined('children.[pets, movies]')
    .whereIn('children.firstName', ['Arnold', 'Jennifer'])
    .where('children:pets.name', 'Fluffy')
    .where('children:movies.name', 'like', 'Terminator%');

  await Person.query().withGraphJoined('pets').where('persons.id', '>', 100);

  const builder = Person.query().withGraphFetched('children.pets(onlyId)');

  const expr = builder.graphExpressionObject();
  expr.children.movies = true;
  builder.withGraphFetched(expr);

  await Person.query().allowGraph('[children.pets, movies]').withGraphFetched('movies.actors');

  await Person.query().allowGraph('[children.pets, movies]').withGraphFetched('children.pets');

  await Person.query()
    .allowGraph('[children.pets, movies]')
    .insertGraph({
      firstName: 'Sylvester',
      children: [
        {
          firstName: 'Sage',
          pets: [
            {
              name: 'Fluffy',
              species: 'dog',
            },
            {
              name: 'Scrappy',
              species: 'dog',
            },
          ],
        },
      ],
    });

  await Person.query()
    .allowGraph('[children.pets, movies]')
    .upsertGraph({
      firstName: 'Sylvester',
      children: [
        {
          firstName: 'Sage',
          pets: [
            {
              name: 'Fluffy',
              species: 'dog',
            },
            {
              name: 'Scrappy',
              species: 'dog',
            },
          ],
        },
      ],
    });

  await Person.query().clearAllowGraph();
  await Person.query().clearWithGraph();

  await Person.query()
    .withGraphFetched('[children.[pets, movies], movies]')
    .modifyGraph('children.pets', (builder) => {
      builder.where('age', '>', 10);
    });

  await Person.query()
    .withGraphFetched('[children.[pets, movies], movies]')
    .modifyGraph('children.[pets, movies]', (builder) => {
      builder.orderBy('id');
    });

  await Person.query()
    .withGraphFetched('[children.[pets, movies], movies]')
    .modifyGraph('[children.movies, movies]', (builder) => {
      builder.where('name', 'like', '%Predator%');
    });

  await Person.query()
    .withGraphFetched('[children.[pets, movies], movies]')
    .modifyGraph('children.movies', 'selectId');
})();
