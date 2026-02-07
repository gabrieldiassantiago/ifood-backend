import { beforeEach, describe, expect, it, mock } from 'bun:test'
import { Elysia, t } from 'elysia'
import { UsersService } from '../modules/users/users.service'
import { UsersRepository } from '../modules/users/users.repository';
import { Role } from '../../generated/prisma/enums';

describe("UsersService", () => {
    let service: UsersService;
    let mockRepository: UsersRepository;

    beforeEach(() => {
        mockRepository = {
            findAll: mock(() => Promise.resolve([])),
            findById: mock(() => Promise.resolve(null)),
            findByEmail: mock(() => Promise.resolve(null)),
            findByPhone: mock(() => Promise.resolve(null)),
            create: mock(() => Promise.resolve({} as any)),
        } as unknown as UsersRepository;  

        service = new UsersService(mockRepository);
    });

    describe("getAllUsers", () => {
        it("Deve retornar uma lista de usuários", async () => {
            const mockUsers = [
               {
                    id: "1",
                    name: "João Silva",
                    phone: "11987654321",
                    email: "joao@example.com",
                    role: Role.USER,
                    createdAt: new Date(),
                },
                {
                    id: "2",
                    name: "Maria Santos",
                    phone: "11987654322",
                    email: "maria@example.com",
                    role: Role.USER,
                    createdAt: new Date(),
                }
            ]
            mockRepository.findAll = mock(() => Promise.resolve(mockUsers)) as any;
        

            const result = await service.getAllUsers();

            console.log(result);

            expect(result).toEqual(mockUsers);

            expect(mockRepository.findAll).toHaveBeenCalled();

        })
    })

    describe("createUser", () => {
        it("Deve criar um novo usuário", async () => {

            const userData = {
                name: "Carlos Pereira",
                phone: "11987654323",
                email: "carlos@gmail.com",
                password: "senhaSegura123",
            }

            const createdUser = {
                id: "31",
                name: userData.name,
                phone: userData.phone,
                email: userData.email,
                role: Role.USER,
                createdAt: new Date(),
            };

            mockRepository.create = mock(() => Promise.resolve(createdUser)) as any;
            mockRepository.findByEmail = mock(() => Promise.resolve(null)) as any;
            mockRepository.findByPhone = mock(() => Promise.resolve(null)) as any;

            const result = await service.createUser(userData);

            expect(result).toEqual(createdUser);
            expect(mockRepository.findByEmail).toHaveBeenCalledWith(userData.email);
            expect(mockRepository.findByPhone).toHaveBeenCalledWith(userData.phone);
            expect(mockRepository.create).toHaveBeenCalled();

        })

        it("Deve lançar um erro se o email já estiver em uso", async () => {
            const userData = {
                name: "Ana Costa",
                phone: "11987654324",
                email: "ana@gmail.com",
                password: "senhaSegura123",
            }

            const existingUser = {
                id: "32",
                name: "Ana Costa",
                phone: "11987654325",
                email: "ana2@gmail.com",
                password: "hashedPassword",
                role: Role.USER,
                createdAt: new Date(),
            };

            mockRepository.findByEmail = mock(() => Promise.resolve(existingUser)) as any;
            mockRepository.findByPhone = mock(() => Promise.resolve(null)) as any;

            await expect(service.createUser(userData)).rejects.toThrow("Email já em uso");
            expect(mockRepository.findByEmail).toHaveBeenCalledWith(userData.email);
            expect(mockRepository.create).not.toHaveBeenCalled();
            
        })
    })
    
})