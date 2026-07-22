import PPTRouteApi from "../../service/ppt/route.api";

export default async function viewRoute(slug: string) {
  return await PPTRouteApi.getBySlug(slug);
}
