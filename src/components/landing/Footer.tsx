import { Code2 } from "lucide-react";

const Footer = () => (
  <footer className="border-t border-border/50 py-12">
    <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-6 sm:flex-row">
      <div className="flex items-center gap-2">
        <Code2 className="h-5 w-5 text-primary" />
        <span className="font-semibold text-foreground">CodeScope <span className="text-primary">AI</span></span>
      </div>
      <p className="text-sm text-muted-foreground">© 2026 CodeScope AI. All rights reserved.</p>
    </div>
  </footer>
);

export default Footer;
