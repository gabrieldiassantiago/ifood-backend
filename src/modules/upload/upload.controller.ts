import { Elysia, t } from "elysia";
import { UploadService } from "./upload.service";

const service = new UploadService();

export const upload = new Elysia({ prefix: "/upload" })

  //falta autorização aqui ainda


 .post(
    "/product/:productId",
    async ({params, body}) => {
        const result  = await service.uploadFile(body.file, params.productId);
        return result;
    },
    {
        body: t.Object({
            file: t.File()
        }),
        tags: ["Upload"],
        summary: "Upload de imagem para um produto",
        description: "Faz upload de uma imagem para um produto específico e retorna a URL da imagem armazenada.",
    }
 )
