module.exports = (sequelize, DataTypes) => {
  const Department = sequelize.define(
    'Department',
    {
      department_id: {
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
      description: DataTypes.STRING(1000),
    },
    {
      timestamps: false,
      tableName: 'department',
    }
  );

  Department.associate = (models) => {
    models.Department.hasMany(models.Category, {
      foreignKey: 'department_id'
    });

    models.Department.belongsToMany(models.Product, {
      through: 'ProductDepartment',
      foreignKey: 'department_id'
    });
  };

  return Department;
};
