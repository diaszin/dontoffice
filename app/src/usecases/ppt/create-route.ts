import PPTRouteApi from "../../service/ppt/route.api";

export default async function createRoute(slug: string, file: File) {
  return await PPTRouteApi.create(slug, file);
}
