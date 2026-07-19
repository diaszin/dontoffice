import PPTRouteApi from "../../service/ppt/route.api";

export default function createRoute(slug: string, file: File) {
  PPTRouteApi.create(slug, file);
}
