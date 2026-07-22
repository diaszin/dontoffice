import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "@tanstack/react-router";
import viewRoute from "../../usecases/ppt/view-route";
import viewSlideFile from "../../usecases/ppt/view-slide-file";
import { SlideRenderer } from "../../components/SlideRenderer";
import { Loader2 } from "lucide-react";

export default function PPTViewPage() {
  const { slug } = useParams({
    from: "/ppt/$slug",
  });

  const navigate = useNavigate();

  const query = useQuery({
    queryKey: ["ppt", slug],
    queryFn: async () => {
      const response = await viewRoute(slug);
      const fileURL = response.data["upload"];

      const fileResponse = await viewSlideFile(fileURL);

      return {
        routeData: response.data,
        arrayBuffer: fileResponse.data,
      };
    },
    retry: 2,
    staleTime: () => {
      const minutes = 2;
      const ms = 60000;

      const minutesToMs = minutes * ms;

      return minutesToMs; 
    },
  });

  if (query.isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <Loader2 className="h-10 w-10 animate-spin text-gray-500" />
      </div>
    );
  }

  if (query.isError || !query.data) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-950 text-red-400">
        <p>Erro ao carregar a apresentação.</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full p-4 sm:p-8">
      <SlideRenderer
        arrayBuffer={query.data.arrayBuffer}
        closeTitle="Voltar para a página principal"
        downloadURL={query.data.routeData.upload}
        onClose={() => {
          navigate({
            to: "/ppt",
          });
        }}
      />
    </div>
  );
}
