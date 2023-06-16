import { Resolver,Query, Args, Mutation } from "@nestjs/graphql";
import { Restaurant } from "./entities/restaurant.entity";
import { CreateRestaurantDto } from "./dtos/create-restaurant.dto";
import { RestaurantService } from "./restaurants.service";


@Resolver(of => Restaurant)

export class RestaurantsResolver {
    constructor(private readonly restaurantService : RestaurantService){}

    @Query(returns => [Restaurant])
    restaurants(): Promise<Restaurant[]> {
        return this.restaurantService.getAll();
    }

    @Mutation(returns => Boolean)
    async createRestaurant(
      @Args('input') createRestaurantDto: CreateRestaurantDto,
    ): Promise<boolean> {
      try {
        await this.restaurantService.createRestaurant(createRestaurantDto)
        return true;
      } catch (e) {
        console.log(e);
        return false;
      }
    }
   

}