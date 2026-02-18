import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { firebaseApp } from "./firebaseconfig";

export class UploadService {
    private storage = getStorage(firebaseApp);

    async uploadFile(file: File, productId: string): Promise<string> {
        const fileName = `products/${productId}/${file.name}`;

        const storageRef = ref(
            this.storage,
            fileName
        )
        await uploadBytes(storageRef, file);
        return getDownloadURL(storageRef);
    }
}