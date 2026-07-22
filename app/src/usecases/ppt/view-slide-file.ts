import PPTRouteApi from "../../service/ppt/route.api";

export default async function viewSlideFile(url: string) {
  return await PPTRouteApi.getSlide(url);
}
