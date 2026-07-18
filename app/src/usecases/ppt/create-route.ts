import PPTRouteApi from "../../service/ppt/route.api";

export default function createRoute(slug: string, file: File) {
  const filename = file.webkitRelativePath;
  PPTRouteApi.create(slug, filename);
}
