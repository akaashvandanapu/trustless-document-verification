import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 md:px-6 py-12">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="flex items-center space-x-3">
            <span className="text-xl font-bold">Wisk</span>
            <Button 
              variant="ghost" 
              size="sm"
              asChild
            >
              <a 
                href="https://github.com/akaashvandanapu/trustless-document-verification" 
                target="_blank" 
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors"
              >
                <Github className="h-4 w-4" />
              </a>
            </Button>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Trustless background verification with DigiLocker and SNARK proofs. Secure, private, employer-ready.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
