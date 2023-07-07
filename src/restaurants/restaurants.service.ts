import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Restaurant } from "./entities/restaurant.entity";
import { Repository } from "typeorm";
import { CreateRestaurantInput, CreateRestaurantOutput } from './dtos/create-restaurant.dto';
import { User } from "src/users/entities/user.entity";
import { Category } from "./entities/category.entity";
import { EditRestaurantInput, EditRestaurantOutput } from './dtos/edit-restaurant.dto';


@Injectable()
export class RestaurantService {
    constructor(
        @InjectRepository(Restaurant)
        private readonly restaurants: Repository<Restaurant>,
        @InjectRepository(Category)
        private readonly categories: Repository<Category>
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
}
