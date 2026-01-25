import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { ArrowLeft, Shield, Database, Cookie, Lock, Phone, User, Activity } from "lucide-react";

/**
 * Privacy policy page with structured sections about data collection and usage.
 */
export default function Privacy() {
  return (
    <div className="min-h-screen bg-background col-start-1 col-end-6 row-start-1 row-end-4">
      {/* Header */}
      <header className="bg-gradient-to-r from-salmon-400 to-salmon-500 text-white">
        <div className="container-wide py-8 md:py-12">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to home
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Shield className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <h1 className="font-capriola text-3xl md:text-4xl">Privacy Policy</h1>
              <p className="text-white/90">How we protect your information</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container-tight py-8 px-4">
        <Card className="max-w-4xl mx-auto">
          <CardHeader>
            <CardTitle className="text-salmon-600 dark:text-salmon-400 font-capriola text-2xl">
              Privacy Policy
            </CardTitle>
            <CardDescription>Effective date: October 08, 2019</CardDescription>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none text-foreground space-y-6">
            <p className="text-muted-foreground">
              Save A Stray ("us", "we", or "our") operates the Save A Stray website
              (the "Service"). This page informs you of our policies regarding the
              collection, use, and disclosure of personal data when you use our
              Service and the choices you have associated with that data.
            </p>

            <section className="bg-salmon-50 dark:bg-salmon-900/20 rounded-xl p-5">
              <h2 className="text-lg font-bold text-salmon-600 dark:text-salmon-400 flex items-center gap-2 mt-0 mb-3">
                <Database className="h-5 w-5" aria-hidden="true" />
                Information Collection And Use
              </h2>
              <p className="text-muted-foreground mb-0">
                We collect several different types of information for various
                purposes to provide and improve our Service to you.
              </p>
            </section>

            <section className="bg-warm-gray-50 dark:bg-warm-gray-800/50 rounded-xl p-5">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mt-0 mb-3">
                <User className="h-4 w-4 text-sky-blue-500" aria-hidden="true" />
                Personal Data
              </h3>
              <p className="text-muted-foreground mb-3">
                While using our Service, we may ask you to provide us with certain
                personally identifiable information that can be used to contact or
                identify you ("Personal Data"). Personally identifiable information
                may include, but is not limited to:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground mb-0">
                <li>Email address</li>
                <li>First name and last name</li>
                <li>Phone number</li>
                <li>Address, State, Province, ZIP/Postal code, City</li>
                <li>Cookies and Usage Data</li>
              </ul>
            </section>

            <section className="bg-warm-gray-50 dark:bg-warm-gray-800/50 rounded-xl p-5">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mt-0 mb-3">
                <Activity className="h-4 w-4 text-sky-blue-500" aria-hidden="true" />
                Usage Data
              </h3>
              <p className="text-muted-foreground mb-0">
                We may also collect information how the Service is accessed and used
                ("Usage Data").
              </p>
            </section>

            <section className="bg-warm-gray-50 dark:bg-warm-gray-800/50 rounded-xl p-5">
              <h3 className="text-base font-semibold text-foreground flex items-center gap-2 mt-0 mb-3">
                <Cookie className="h-4 w-4 text-salmon-500" aria-hidden="true" />
                Tracking & Cookies Data
              </h3>
              <p className="text-muted-foreground mb-0">
                We use cookies and similar tracking technologies to track the
                activity on our Service and hold certain information.
              </p>
            </section>

            <section className="bg-sky-blue-50 dark:bg-sky-blue-900/20 rounded-xl p-5">
              <h2 className="text-lg font-bold text-sky-blue-600 dark:text-sky-blue-400 flex items-center gap-2 mt-0 mb-3">
                <Database className="h-5 w-5" aria-hidden="true" />
                Use of Data
              </h2>
              <p className="text-muted-foreground mb-3">
                Save A Stray uses the collected data for various purposes:
              </p>
              <ul className="list-disc pl-6 space-y-1 text-muted-foreground mb-0">
                <li>To provide and maintain the Service</li>
                <li>To notify you about changes to our Service</li>
                <li>To provide customer care and support</li>
                <li>To monitor the usage of the Service</li>
                <li>To detect, prevent and address technical issues</li>
              </ul>
            </section>

            <section className="bg-warm-gray-50 dark:bg-warm-gray-800/50 rounded-xl p-5">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mt-0 mb-3">
                <Lock className="h-5 w-5 text-green-500" aria-hidden="true" />
                Security Of Data
              </h2>
              <p className="text-muted-foreground mb-0">
                The security of your data is important to us, but remember that no
                method of transmission over the Internet, or method of electronic
                storage is 100% secure.
              </p>
            </section>

            <section className="border-t border-warm-gray-200 dark:border-warm-gray-700 pt-6">
              <h2 className="text-lg font-bold text-foreground flex items-center gap-2 mt-0 mb-3">
                <Phone className="h-5 w-5 text-salmon-500" aria-hidden="true" />
                Contact Us
              </h2>
              <p className="text-muted-foreground mb-0">
                If you have any questions about this Privacy Policy, please contact
                us by phone: 217-508-9193
              </p>
            </section>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
