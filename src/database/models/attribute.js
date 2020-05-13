module.exports = (sequelize, DataTypes) => {
  const Attribute = sequelize.define(
    'Attribute',
    {
      attribute_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
        },
      },
    },
    {
      timestamps: false,
      tableName: 'attribute',
    }
  );

  Attribute.associate = (models) => {
    models.Attribute.hasMany(models.AttributeValue, {
      foreignKey: 'attribute_id',
    });
  };

  return Attribute;
};
