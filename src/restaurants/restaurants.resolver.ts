import { Resolver,Query, Args, Mutation } from "@nestjs/graphql";
import { Restaurant } from "./entities/restaurant.entity";
import { RestaurantService } from "./restaurants.service";
import { AuthUser } from "src/auth/auth-user.decorator";
import { User } from "src/users/entities/user.entity";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-restaurant.dto";


@Resolver(of => Restaurant)

export class RestaurantsResolver {
    constructor(private readonly restaurantService : RestaurantService){}

    @Mutation(returns => CreateRestaurantOutput)
    async createRestaurant(
      @AuthUser() authUser: User,
      @Args('input') createRestaurantInput: CreateRestaurantInput,
    ): Promise<CreateRestaurantOutput> {
        return this.restaurantService.createRestaurant(
          authUser,
          createRestaurantInput
        )
    }

    @Mutation(returns => EditRestaurantOutput)
    async editRestaurant(
      @AuthUser() owner: User,
      @Args('input') editRestaurantInput: EditRestaurantInput,
    ): Promise <EditRestaurantOutput> {
      return this.restaurantService.editRestaurant(
        owner,
        editRestaurantInput
      )
    }
   

}