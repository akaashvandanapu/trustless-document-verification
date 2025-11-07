import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield } from "lucide-react";
import Link from "next/link";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-50" />

      <div className="container px-4 md:px-6 relative z-10">
        <div className="flex flex-col items-center space-y-8 text-center max-w-4xl mx-auto">
          <img src="./logo.png" alt="Logo" className="h-64 w-64" />
          <div className="fade-in">
            <Badge variant="secondary" className="mb-4">
              <Shield className="w-3 h-3 mr-1" />
              Trustless Verification
            </Badge>
          </div>

          <div className="space-y-4 slide-up">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tighter">
              Background verification
              <br />
              <span className="text-muted-foreground">without the trust</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Zero-knowledge proofs meet DigiLocker. Verify credentials
              instantly while keeping your documents private. No middlemen, no
              databases, no compromises.
            </p>
          </div>

          <div
            className="flex flex-col sm:flex-row gap-6 slide-up"
            style={{ animationDelay: "0.2s" }}
          >
            <Button size="lg" asChild>
              <Link href="/academic">Academic Verification</Link>
            </Button>
            <Button size="lg" asChild>
              <Link href="/pan">Pancard Verification</Link>
            </Button>
            <Button size="lg" asChild>
              <Link href="/name">Name Verification</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
