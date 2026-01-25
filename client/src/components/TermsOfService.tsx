import React from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { ArrowLeft, FileText, Shield, Link2, AlertCircle, Scale } from "lucide-react";

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-background col-start-1 col-end-6 row-start-1 row-end-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-sky-blue-500 to-sky-blue-600 text-white">
        <div className="container-wide py-8 md:py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <FileText className="h-6 w-6" />
            </div>
            <div>
              <h1 className="font-capriola text-3xl md:text-4xl">Terms of Service</h1>
              <p className="text-white/90">Please read these terms carefully</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-tight py-8 px-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-sky-blue-600 dark:text-sky-blue-400 font-capriola text-2xl">
              Welcome to Save A Stray
            </CardTitle>
            <CardDescription>
              Last updated: October 2019
            </CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-foreground space-y-6">
            <p className="text-muted-foreground">
              These terms and conditions outline the rules and regulations for the
              use of Save A Stray's Website. By accessing this website we assume you
              accept these terms and conditions in full. Do not continue to use
              Save A Stray's website if you do not accept all of the terms and
              conditions stated on this page.
            </p>

            <div className="bg-sky-blue-50 dark:bg-sky-blue-900/20 rounded-xl p-5">
              <h2 className="text-lg font-bold text-sky-blue-600 dark:text-sky-blue-400 flex items-center gap-2 mt-0 mb-3">
                <Shield className="h-5 w-5" />
                Cookies
              </h2>
              <p className="text-muted-foreground mb-0">
                We employ the use of cookies. By using Save A Stray's website you
                consent to the use of cookies in accordance with Save A Stray's
                privacy policy.
              </p>
            </div>

            <div className="bg-warm-gray-50 dark:bg-warm-gray-800/50 rounded-xl p-5">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mt-0 mb-3">
                <Scale className="h-5 w-5 text-salmon-500" />
                License
              </h2>
              <p className="text-muted-foreground mb-3">
                Unless otherwise stated, Save A Stray and/or its licensors own the
                intellectual property rights for all material on Save A Stray. All
                intellectual property rights are reserved.
              </p>
              <p className="text-muted-foreground font-medium mb-2">You must not:</p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground mb-0">
                <li>Republish material from Save A Stray</li>
                <li>Sell, rent or sub-license material from Save A Stray</li>
                <li>Reproduce, duplicate or copy material from Save A Stray</li>
              </ul>
            </div>

            <div className="bg-warm-gray-50 dark:bg-warm-gray-800/50 rounded-xl p-5">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mt-0 mb-3">
                <Link2 className="h-5 w-5 text-sky-blue-500" />
                Hyperlinking to our Content
              </h2>
              <p className="text-muted-foreground mb-2">
                The following organizations may link to our Web site without prior
                written approval:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground mb-0">
                <li>Government agencies</li>
                <li>Search engines</li>
                <li>News organizations</li>
                <li>Online directory distributors</li>
              </ul>
            </div>

            <div className="bg-warm-gray-50 dark:bg-warm-gray-800/50 rounded-xl p-5">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mt-0 mb-3">
                <AlertCircle className="h-5 w-5 text-salmon-500" />
                Reservation of Rights
              </h2>
              <p className="text-muted-foreground mb-0">
                We reserve the right at any time and in its sole discretion to
                request that you remove all links or any particular link to our Web
                site.
              </p>
            </div>

            <div className="border-t border-warm-gray-200 dark:border-warm-gray-700 pt-6">
              <h2 className="text-lg font-bold text-foreground mt-0 mb-3">
                Content Liability
              </h2>
              <p className="text-muted-foreground">
                We shall have no responsibility or liability for any content
                appearing on your Web site.
              </p>
            </div>

            <div className="border-t border-warm-gray-200 dark:border-warm-gray-700 pt-6">
              <h2 className="text-lg font-bold text-foreground mt-0 mb-3">
                Disclaimer
              </h2>
              <p className="text-muted-foreground mb-0">
                To the maximum extent permitted by applicable law, we exclude all
                representations, warranties and conditions relating to our website
                and the use of this website.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsOfService;
