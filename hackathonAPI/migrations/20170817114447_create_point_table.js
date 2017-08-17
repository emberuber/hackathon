exports.up = function (knex) {
  return knex.schema.createTable('point', function (t) {
    t.increments('id').primary()
    t.decimal('lat', 14, 10).notNullable();
 	t.decimal('lng', 14, 10).notNullable();
    t.boolean('isIllegalPoint').notNullable()
    t.timestamps(false, true)
  })
}
exports.down = function (knex) {
  return knex.schema.dropTableIfExists('point')
}
