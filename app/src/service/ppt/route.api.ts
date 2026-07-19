import { pptApiClient } from "../shared";

export default class PPTRouteApi {
  static async create(slug: string, file: File) {
    const data = new FormData();

    data.append("slug", slug);
    data.append("upload", file);

    await pptApiClient.post("/route/", data);
  }
}
