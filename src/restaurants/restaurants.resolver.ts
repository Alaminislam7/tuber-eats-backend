import { Resolver,Query, Args, Mutation, ResolveField, Parent, Int } from "@nestjs/graphql";
import { AuthUser } from "src/auth/auth-user.decorator";
import { User } from "src/users/entities/user.entity";
import { CreateRestaurantInput, CreateRestaurantOutput } from "./dtos/create-restaurant.dto";
import { EditRestaurantInput, EditRestaurantOutput } from "./dtos/edit-restaurant.dto";
import { Role } from "src/auth/role.decorator";
import { DeleteRestaurantInput, DeleteRestaurantOutput } from "./dtos/delete-restaurant.dto";
import { Restaurant } from "./entities/restaurant.entity";
import { RestaurantService } from "./restaurants.service";
import { AllCategoriesOutput } from "./dtos/all-categories.dto";
import { Category } from "./entities/category.entity";
import { CategoryInput, CategoryOutput } from "src/users/dtos/category.dto";



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
    @Role(['Owner'])
    async editRestaurant(
      @AuthUser() owner: User,
      @Args('input') editRestaurantInput: EditRestaurantInput,
    ): Promise <EditRestaurantOutput> {
      return this.restaurantService.editRestaurant(
        owner,
        editRestaurantInput
      )
    }

    @Mutation(returns => DeleteRestaurantOutput)
    @Role(['Owner'])
    async deleteRestaurant(
      @AuthUser() owner: User,
      @Args('input') deleteRestaurantInput:DeleteRestaurantInput
    ): Promise <DeleteRestaurantOutput> {
      return this.restaurantService.deleteRestaurant(owner, deleteRestaurantInput)
    }
}

@Resolver(of => Category)
export class CategoryResolver {
  constructor(private readonly restaurantService: RestaurantService) {}

  @ResolveField(type => Int)
  restaurantCount(@Parent() category: Category): number {
    console.log(category)
    return 40
  }

  @Query(type => AllCategoriesOutput)
  allCategories(): Promise<AllCategoriesOutput>{
    return this.restaurantService.allCategories();
  }

  @Query(type => CategoryOutput)
  category(
    @Args('input') categoryInput: CategoryInput
  ): Promise<CategoryOutput>{
    return this.restaurantService.findCategoryBySlug(categoryInput)
  }

}