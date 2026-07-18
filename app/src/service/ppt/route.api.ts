import { pptApiClient } from "../shared";

export default class PPTRouteApi {
    static async create(slug: string, file: string){
        await pptApiClient.post("/route/", {
            slug: slug,
            upload: file
        })
    }
}
