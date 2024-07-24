import { Model, QueryBuilder, Page, TransactionOrKnex, ObjectRelationExpression, GraphOptions, OnlyKeysFromModel, RestrictType, SetRequired, StringRelationExpression } from '../../';


interface GraphFetchedMethod<M extends Model> {
  <Expr extends ObjectRelationExpression<M>>(
    expr: RestrictType<Expr, ObjectRelationExpression<M>>,
    options?: GraphOptions,
  ): CustomQueryBuilder<
    // Model is here to satisfy the Model requirement in the CustomQueryBuilder type
    // sometimes creates errors because of recursivity
    Model & SetRequired<M, Expr>
  >;
  (expr: StringRelationExpression<M>, options?: GraphOptions): CustomQueryBuilder<M>;
}

// class customCustomQueryBuilder<M extends Model, R = M[]> extends CustomQueryBuilder<M, R> {
//   <Expr extends ObjectRelationExpression<M>>(
//     expr: RestrictType<Expr, ObjectRelationExpression<M>>,
//     options?: GraphOptions,
//   ): CustomQueryBuilder<
//     // Model is here to satisfy the Model requirement in the CustomQueryBuilder type
//     // sometimes creates errors because of recursivity
//     Model & SetRequired<M, Expr>
//   >;
//   (expr: StringRelationExpression<M>, options?: GraphOptions): CustomQueryBuilder<M>;
// }
class CustomQueryBuilder<M extends Model, R = M[]> extends QueryBuilder<M, R> {
  ArrayQueryBuilderType!: CustomQueryBuilder<M, M[]>;
  SingleQueryBuilderType!: CustomQueryBuilder<M, M>;
  MaybeSingleQueryBuilderType!: CustomQueryBuilder<M, M | undefined>;
  NumberQueryBuilderType!: CustomQueryBuilder<M, number>;
  PageQueryBuilderType!: CustomQueryBuilder<M, Page<M>>;
  GraphFetchedQueryBuilderType!: GraphFetchedMethod<M>;

  someCustomMethod(): this {
    return this;
  }

  delete() {
    return super.delete();
  }
}

class BaseModel extends Model {
  QueryBuilderType!: CustomQueryBuilder<this>;

  $query(trxOrKnex?: TransactionOrKnex) {
    return super.$query(trxOrKnex);
  }
}

class Animal extends BaseModel {
  id!: number;
  name!: string;
  owner!: Person;
}

class Person extends BaseModel {
  firstName!: string;
  pets!: Animal[];
}

const people: CustomQueryBuilder<Person, Person[]> = Person.query()
  .someCustomMethod()
  .where('firstName', 'lol')
  .someCustomMethod()
  .with('someAlias', (qb) => qb.someCustomMethod().from('lol').select('id'))
  .modifyGraph<Animal>('pets', (qb) => qb.someCustomMethod().where('id', 1).someCustomMethod());

const pets: CustomQueryBuilder<Animal, Animal | undefined> = new Person()
  .$relatedQuery('pets')
  .someCustomMethod()
  .where('id', 1)
  .first()
  .someCustomMethod();

const numUpdated: CustomQueryBuilder<Person, number> = Person.query()
  .someCustomMethod()
  .patch({ firstName: 'test' })
  .someCustomMethod();

const allPets: PromiseLike<Animal[]> = Person.relatedQuery('pets')
  .for(Person.query().select('id'))
  .someCustomMethod();


(async () => {
  const testToJson = await Person.query().withGraphFetched({ pets: true });
  testToJson[0].toJSON();
  const testToJsonFirst = await Person.query().withGraphFetched({ pets: true }).first();
  // const testToJsonFirst = await Person.query().withGraphFetched('pets').first();
  testToJsonFirst?.toJSON();
})