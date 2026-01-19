import { Elysia } from "elysia";
import { openapi } from "@elysiajs/openapi";      // ← novo plugin
import { staticPlugin } from "@elysiajs/static";
import { cors } from "@elysiajs/cors";
import { users } from "./modules/users/users.controller";
import { auth } from "./modules/auth/auth.controller";
import { products } from "./modules/products/product.controller";
import { orders } from "./modules/orders/order.controller";
import { payments } from "./modules/payments/payment.controller";
import { addresses } from "./modules/addresses/address.controller";
import { deliveryFees } from "./modules/delivery/delivery.controller";
import { categories } from "./modules/categories/category.controller";
import { uploadController } from "./modules/upload/upload.controller";
import { configureMercadoPago } from "./config/mercadopago.config";
import { store } from "./modules/store/store.controller";
import { websocket } from "./modules/websocket/websocket.controller";
import { z } from "zod"; 
 
try {
  configureMercadoPago();
  console.log(" Mercado Pago configurado com sucesso");
} catch (error) {
  console.warn("  Mercado Pago não configurado:", (error as Error).message);
}

const app = new Elysia()
  .use(cors())
  .use(staticPlugin({
    assets: "public",
    prefix: "/",
  }))
  .use(
    openapi({
      path: "/docs",

      provider: "scalar",

      documentation: {
        info: {
          title: "iFood Clone API Documentation",
          version: "1.0.0",
          description:
            "API completa para um clone do iFood com sistema de pedidos, pagamentos PIX via Mercado Pago, gestão de produtos e usuários.",
        },
        tags: [
          { name: "Auth", description: "Endpoints de autenticação" },
          { name: "Users", description: "Gestão de usuários" },
          { name: "Products", description: "Gestão de produtos" },
          { name: "Categories", description: "Gestão de categorias" },
          { name: "Orders", description: "Gestão de pedidos" },
          { name: "Payments", description: "Processamento de pagamentos" },
          { name: "Addresses", description: "Gestão de endereços" },
          { name: "Delivery", description: "Taxas e bairros de entrega" },
        ],
        components: {
          securitySchemes: {
            bearerAuth: {
              type: "http",
              scheme: "bearer",
              bearerFormat: "JWT",
              description: "Token JWT obtido através do login",
            },
          },
        },
      },

      mapJsonSchema: {
        zod: z.toJSONSchema,  
      },

      exclude: {
        methods: ["OPTIONS"],
      },

    })
  )

  .get("/api", () => ({
    message: "iFood API",
    version: "1.0.0",
    docs: "/docs",
    client: "/",
  }))

  .use(users)
  .use(auth)
  .use(products)
  .use(categories)
  .use(orders)
  .use(payments)
  .use(addresses)
  .use(deliveryFees)
  .use(store)
  .use(uploadController)
  .use(websocket)
  .listen(3001);

console.log(
  `🦊 Diva rodando ${app.server?.hostname}:${app.server?.port}`
);