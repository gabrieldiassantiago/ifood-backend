import { CreateUserInput, UserResponse } from "./model";
import { UsersRepository } from "./users.repository";

export class UsersService {
    constructor(
        private usersRepository: UsersRepository = new UsersRepository() 
    )
    {}

    async getAllUsers(): Promise<UserResponse[]> {
        const users = await this.usersRepository.findAll();
        return users;
    }

    async getUserById(id: string): Promise<UserResponse | null> {
        const user = await this.usersRepository.findById(id);
        return user;
    }
    
    async createUser(data: CreateUserInput): Promise<UserResponse> {
      
        const existingUserByEmail = data.email ? await this.usersRepository.findByEmail(data.email) : null;

        if (existingUserByEmail) {
            throw new Error("Email already in use");
        }
        
        const existingUserByPhone = await this.usersRepository.findByPhone(data.phone);

        if (existingUserByPhone) {
            throw new Error("Phone number already in use");
        }

        const newUser = await this.usersRepository.create(data);
        return newUser;

    }
}