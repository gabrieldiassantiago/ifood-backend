import { CreateUserInput, UserResponse } from "./model";
import { UsersRepository } from "./users.repository";

export class UsersService {
    constructor(
        private usersRepository: UsersRepository = new UsersRepository() 
    )
    {}

    /*async getAllUsers(): Promise<UserResponse[]> {
        const users = await this.usersRepository.findAll();
        return users;
    }
    */

    async getUserById(id: string): Promise<UserResponse | null> {
        const user = await this.usersRepository.findById(id);
        return user;
    }

    async createUser(data: CreateUserInput): Promise<UserResponse> {
      
        
        const existingUserByPhone = await this.usersRepository.findByPhone(data.phone);

        if (existingUserByPhone) {
            throw new Error("Número de telefone já em uso");
        }
        

       const hashedPassword = await Bun.password.hash(data.password, {
        algorithm: "bcrypt",
        cost: 4,
       });

       const newUser = await this.usersRepository.create({
        ...data,
        password: hashedPassword,
        
       })
       
       return newUser;

    }
}