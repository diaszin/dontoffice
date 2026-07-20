import { pptApiClient } from "../shared";

export default class PPTRouteApi {
  static async create(slug: string, file: File) {
    const data = new FormData();

    data.append("slug", slug);
    data.append("upload", file);

    const response = await pptApiClient.post("/route/", data);

    return response;
  }

  static async getBySlug(slug: string) {
    const response = await pptApiClient.get(`/route/${slug}/`);

    console.log(response);

    return response;
  }

  static async getSlide(url: string) {
    const response = await pptApiClient.get(url, {
      responseType: "arraybuffer",
    });

    console.log(response);

    return response;
  }
}
