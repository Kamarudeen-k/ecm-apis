module.exports = (sequelize, DataTypes) => {
    const Review = sequelize.define(
      'Review',
      {
        review_id: {
          type: DataTypes.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false
        },
        customer_id: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        product_id: {
          type: DataTypes.INTEGER,
          allowNull: false
        },
        review: {
          type: DataTypes.TEXT,
          allowNull: false
        },
        rating: {
          type: DataTypes.SMALLINT,
          allowNull: false
        },
        created_on: {
            type: DataTypes.DATE,
            allowNull: false
          },
      },
      {
        timestamps: false,
        tableName: 'review',
      }
    );
  
    Review.associate = (models) => {
      models.Review.belongsTo(models.Customer, {
        foreignKey: 'customer_id'
      });

      models.Review.belongsTo(models.Product, {
          foreignKey: 'product_id'
      });
    };
  
    return Review;
  };
  