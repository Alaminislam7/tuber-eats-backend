import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Restaurant } from "./entities/restaurant.entity";
import { Raw, Repository } from "typeorm";
import { CreateRestaurantInput, CreateRestaurantOutput } from './dtos/create-restaurant.dto';
import { User } from "src/users/entities/user.entity";
import { Category } from "./entities/category.entity";
import { EditRestaurantInput, EditRestaurantOutput } from './dtos/edit-restaurant.dto';
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-restaurant.dto";
import { AllCategoriesOutput } from "./dtos/all-categories.dto";
import { CategoryInput, CategoryOutput } from "src/users/dtos/category.dto";
import { RestaurantsInput, RestaurantsOutput } from "./dtos/restaurants.dto";
import { RestaurantInput, RestaurantOutput } from "./dtos/restaurant.dto";
import { SearchRestaurantInput, SearchRestaurantOutput } from "./dtos/search-restaurant.dto";
import { Dish } from "./entities/dish.entity";
import { CreateDishInput, CreateDishOutput } from "./dtos/create-dish.dto";
import { EditDishInput, EditDishOutput } from "./dtos/edit-dish.dto";
import { DeleteDishInput, DeleteDishOutput } from "./dtos/delete-dish.dto";
import { MyRestaurantsOutput } from "./dtos/my-restaurants";
import { MyRestaurantInput, MyRestaurantOutput } from "./dtos/my-restaurant";


@Injectable()
export class RestaurantService {
    constructor(
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>,
        @InjectRepository(Category)
        private readonly categories: Repository<Category>,
        private readonly dishes: Repository<Dish>,
    ){}

    async getOrCreate(name: string): Promise<Category>{
        const categoryName = name
                .trim()
                .toLowerCase();
        const categorySlug = categoryName.replace(/ /g, '-');
        let category = await this.categories.findOne({
        where: { slug: categorySlug }
        });
        console.log(category);
        if (!category) {
            category = await this.categories.save(
                this.categories.create({ slug: categorySlug, name: categoryName })
            );
        }
        return category;
    }

    async createRestaurant(
        owner: User,
        createRestaurantInput: CreateRestaurantInput
        ): Promise<CreateRestaurantOutput> {
        try{
            const newRestaurant = this.restaurants.create(createRestaurantInput);
            newRestaurant.owner = owner;


            const category = await this.getOrCreate(
                createRestaurantInput.categoryName,
            )

            newRestaurant.category = category;
            await this.restaurants.save(newRestaurant);
            return {
                ok: true,
                restaurantId: newRestaurant.id,
            };
        } catch {
            return {
                ok: false,
                error: 'Could not create restaurant',
              };
        }
    }

    async editRestaurant(
        owner: User,
        editRestaurantInput: EditRestaurantInput
    ) : Promise<EditRestaurantOutput> {
        try{
            const restaurant = await this.restaurants.findOne({
                where: {
                    id: editRestaurantInput.restaurantId
                }
            });
            if (!restaurant) {
                return {
                  ok: false,
                  error: 'Restaurant not found',
                };
            }
            if (owner.id !== restaurant.ownerId) {
                return {
                  ok: false,
                  error: "You can't edit a restaurant that you don't own",
                };
            }
            let category: Category = null;
            if (editRestaurantInput.categoryName) {
                category = await this.getOrCreate(
                editRestaurantInput.categoryName,
                );
            }
            await this.restaurants.save([
                {
                id: editRestaurantInput.restaurantId,
                ...editRestaurantInput,
                ...(category && { category }),
                },
            ]);
            return {
                ok: true,
            };

            console.log(restaurant);
        } catch {
            return {
                ok: false,
                error: "Could not edit Restaurant"
            }
        }
    }

    async deleteRestaurant(
        owner: User,
        { restaurantId } : DeleteRestaurantInput
    ): Promise <DeleteRestaurantOutput> {
        try {
            const restaurant = await this.restaurants.findOne({
                where: {
                    id: restaurantId
                }
            });
            if(!restaurant) {
                return {
                    ok: false,
                    error: "Restaurant not found"
                }
            }
            if (owner.id !== restaurant.ownerId) {
                return {
                    ok: false,
                    error: "You can't delete a restaurant that you don't own",
                }
            }
            await this.restaurants.delete(restaurantId);
            return {
                ok: true,
            }
        } catch {
            return {
                ok: false,
                error: 'Could not delete restaurant.',
              };
        }
    }

    async allCategories(): Promise<AllCategoriesOutput>{
        try{
            const categories = await this.categories.find();
            return {
                ok: true,
                categories
            }
        } catch {
            return {
                ok: false,
                error: 'Could not load categories',
            };
        }
    }
    
    // countRestaurants(category: Category) {
    //     return this.restaurants.count({ category });
    // }

    async findCategoryBySlug({
        slug,
        page
    }: CategoryInput): Promise<CategoryOutput> {
        try {
            const category = await this.categories.findOne({    
                select: {
                    slug: true
                },
            });
            if (!category) {
                return {
                  ok: false,
                  error: 'Category not found',
                };
            }
            const restaurants = await this.restaurants.find({
                where: {
                    category: true,
                },
                take: 25,
                skip: (page - 1) * 25,
            })
            // const totalResults = await this.countRestaurants(category);
            return {
                ok: true,
                restaurants,
                category,
                // totalPages: Math.ceil(totalResults / 25),
            };
        } catch {
            return {
                ok: false,
                error: 'Could not find category'
            }
        }
    }

    async allRestaurants({ page }: RestaurantsInput): Promise<RestaurantsOutput>{
        try{
            const [restaurants, totalResults] = await this.restaurants.findAndCount({
                skip: (page -1) * 3,
                take: 3
            });
            return {
                ok: true,
                results: restaurants,
                totalPages: Math.ceil(totalResults / 3),
                totalResults
            }
        } catch {
            return {
                ok: false,
                error: 'Could not find restaurants'
            }
        }
    }

    async findRestaurantById({
        restaurantId,
      }: RestaurantInput): Promise<RestaurantOutput | undefined> {
        try {
          const restaurant = await this.restaurants.findOneBy({
                id: restaurantId
            })
          if (!restaurant) {
            return {
              ok: false,
              error: 'Restaurant not found',
            };
          }
          return {
            ok: true,
            restaurant,
          };
        } catch {
          return {
            ok: false,
            error: 'Could not find restaurant',
          };
        }
    }

    async searchRestaurantByName({
        query,
        page
    }: SearchRestaurantInput): Promise<SearchRestaurantOutput>{
        try {
            const [restaurants, totalResults] = await this.restaurants.findAndCount({
              where: {
                name: Raw(name => `${name} ILIKE '%${query}%'`),
              },
              skip: (page - 1) * 25,
              take: 25,
            });
            return {
              ok: true,
              restaurants,
              totalResults,
              totalPages: Math.ceil(totalResults / 25),
            };
          } catch {
            return { ok: false, error: 'Could not search for restaurants' };
          }
    }


    async createDish(
        owner: User,
        createDishInput: CreateDishInput,
      ): Promise<CreateDishOutput> {
        try {
          const restaurant = await this.restaurants.findOne({
            where: {id: createDishInput.restaurantId}
          });
          if (!restaurant) {
            return {
              ok: false,
              error: 'Restaurant not found',
            };
          }
          if (owner.id !== restaurant.ownerId) {
            return {
              ok: false,
              error: "You can't do that.",
            };
          }
          await this.dishes.save(
            this.dishes.create({ ...createDishInput, restaurant }),
          );
          return {
            ok: true,
          };
        } catch (error) {
          console.log(error);
          return {
            ok: false,
            error: 'Could not create dish',
          };
        }
      }
    
      async checkDishOwner(ownerId: number, dishId: number) {}
    
      async editDish(
        owner: User,
        editDishInput: EditDishInput,
      ): Promise<EditDishOutput> {
        try {
          const dish = await this.dishes.findOne({
                where: {id: editDishInput.dishId},
                    relations: ['restaurant'],
            });
          if (!dish) {
            return {
              ok: false,
              error: 'Dish not found',
            };
          }
          if (dish.restaurant.ownerId !== owner.id) {
            return {
              ok: false,
              error: "You can't do that.",
            };
          }
          await this.dishes.save([
            {
              id: editDishInput.dishId,
              ...editDishInput,
            },
          ]);
          return {
            ok: true,
          };
        } catch {
          return {
            ok: false,
            error: 'Could not delete dish',
          };
        }
      }
    
      async deleteDish(
        owner: User,
        { dishId }: DeleteDishInput,
      ): Promise<DeleteDishOutput> {
        try {
          const dish = await this.dishes.findOne({
                where: {id: dishId},
                relations: ['restaurant'],
            });
          if (!dish) {
            return {
              ok: false,
              error: 'Dish not found',
            };
          }
          if (dish.restaurant.ownerId !== owner.id) {
            return {
              ok: false,
              error: "You can't do that.",
            };
          }
          await this.dishes.delete(dishId);
          return {
            ok: true,
          };
        } catch {
          return {
            ok: false,
            error: 'Could not delete dish',
          };
        }
    }

    async myRestaurants(owner: User): Promise<MyRestaurantsOutput>  
        {
            try {
            const restaurants = await this.restaurants.find({ where: {owner: true} });
            return {
                restaurants,
                ok: true,
            };
            } catch {
            return {
                ok: false,
                error: 'Could not find restaurants.',
            };
            }
      }
      async myRestaurant(
        owner: User,
        { id }: MyRestaurantInput,
      ): Promise<MyRestaurantOutput> {
        try {
          const restaurant = await this.restaurants.findOne({
                where: {owner: true, id},
                relations: ['menu', 'orders'] ,
            });
          return {
            restaurant,
            ok: true,
          };
        } catch {
          return {
            ok: false,
            error: 'Could not find restaurant',
          };
        }
      }
}
