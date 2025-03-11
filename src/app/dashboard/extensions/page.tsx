import { createClient } from "../../../../supabase/server";
import { redirect } from "next/navigation";
import DashboardNavbar from "@/components/dashboard-navbar";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

export default async function ExtensionsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/sign-in");
  }

  return (
    <>
      <DashboardNavbar />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Extensions & Integrations</h1>
          <p className="text-muted-foreground mb-8">
            Connect with powerful tools to enhance your development workflow
          </p>

          <Tabs defaultValue="design" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8">
              <TabsTrigger value="design">Design Tools</TabsTrigger>
              <TabsTrigger value="deployment">
                Deployment & Development
              </TabsTrigger>
              <TabsTrigger value="ai">AI Assistants</TabsTrigger>
            </TabsList>

            <TabsContent value="design">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ExtensionCard
                  title="Figma"
                  description="Design, prototype, and collaborate all in the browser"
                  icon="https://cdn.sanity.io/images/599r6htc/localized/46a76c802176eb17b04e12108de7e7e0f3736dc6-1024x1024.png?w=670&h=670&q=75&fit=max&auto=format"
                  url="https://figma.com"
                />
                <ExtensionCard
                  title="Canva"
                  description="Create designs for social media, presentations, and more"
                  icon="https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Canva_icon_2021.svg/2048px-Canva_icon_2021.svg.png"
                  url="https://canva.com"
                />
              </div>
            </TabsContent>

            <TabsContent value="deployment">
              <div className="space-y-8">
                <div>
                  <h2 className="text-xl font-semibold mb-4">
                    Hosting & Deployment
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ExtensionCard
                      title="Netlify"
                      description="Build, deploy, and host your projects with ease"
                      icon="https://cdn.iconscout.com/icon/free/png-256/free-netlify-3628945-3030170.png"
                      url="https://netlify.com"
                    />
                    <ExtensionCard
                      title="Vercel"
                      description="Deploy web projects with the best frontend developer experience"
                      icon="https://assets.vercel.com/image/upload/v1588805858/repositories/vercel/logo.png"
                      url="https://vercel.com"
                    />
                    <ExtensionCard
                      title="GitHub"
                      description="Host and review code, manage projects, and build software"
                      icon="https://github.githubassets.com/assets/GitHub-Mark-ea2971cee799.png"
                      url="https://github.com"
                    />
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold mb-4">Database</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ExtensionCard
                      title="Firebase"
                      description="Google's app development platform with realtime database, authentication, and hosting"
                      icon="https://cdn.iconscout.com/icon/free/png-256/free-firebase-1-282796.png"
                      url="https://firebase.google.com"
                    />
                    <ExtensionCard
                      title="Supabase"
                      description="Open source Firebase alternative with PostgreSQL database, authentication, and storage"
                      icon="https://seeklogo.com/images/S/supabase-logo-DCC676FFE2-seeklogo.com.png"
                      url="https://supabase.com"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="ai">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ExtensionCard
                  title="ChatGPT"
                  description="AI assistant for coding, content creation, and problem-solving"
                  icon="https://upload.wikimedia.org/wikipedia/commons/thumb/0/04/ChatGPT_logo.svg/1024px-ChatGPT_logo.svg.png"
                  url="https://chat.openai.com"
                />
                <ExtensionCard
                  title="Google Gemini"
                  description="Google's multimodal AI that can understand text, code, audio, and images"
                  icon="https://storage.googleapis.com/gweb-uniblog-publish-prod/images/gemini_1.max-1000x1000.png"
                  url="https://gemini.google.com"
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </>
  );
}

function ExtensionCard({
  title,
  description,
  icon,
  url,
}: {
  title: string;
  description: string;
  icon: string;
  url: string;
}) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center gap-4">
        <div className="w-12 h-12 rounded-md overflow-hidden flex-shrink-0">
          <img
            src={icon}
            alt={title}
            className="w-full h-full object-contain"
          />
        </div>
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <a href={url} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" className="w-full">
            <ExternalLink className="h-4 w-4 mr-2" />
            Open {title}
          </Button>
        </a>
      </CardContent>
    </Card>
  );
}
