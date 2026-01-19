import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const TermsOfService: React.FC = () => {
  return (
    <div className="col-start-2 col-end-5 row-start-2 overflow-y-auto p-4">
      <Card className="bg-white max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-sky-blue font-capriola text-3xl">
            Welcome to Save A Stray
          </CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-gray-700 space-y-4">
          <p>
            These terms and conditions outline the rules and regulations for the
            use of Save A Stray's Website.
          </p>
          <p>
            By accessing this website we assume you accept these terms and
            conditions in full. Do not continue to use Save A Stray's website if
            you do not accept all of the terms and conditions stated on this
            page.
          </p>

          <h2 className="text-xl font-bold text-sky-blue mt-6">Cookies</h2>
          <p>
            We employ the use of cookies. By using Save A Stray's website you
            consent to the use of cookies in accordance with Save A Stray's
            privacy policy.
          </p>

          <h2 className="text-xl font-bold text-sky-blue mt-6">License</h2>
          <p>
            Unless otherwise stated, Save A Stray and/or its licensors own the
            intellectual property rights for all material on Save A Stray. All
            intellectual property rights are reserved.
          </p>
          <p>You must not:</p>
          <ol className="list-decimal pl-6 space-y-1">
            <li>Republish material from https://save-a-stray.herokuapp.com</li>
            <li>
              Sell, rent or sub-license material from
              https://save-a-stray.herokuapp.com
            </li>
            <li>
              Reproduce, duplicate or copy material from
              https://save-a-stray.herokuapp.com
            </li>
          </ol>

          <h2 className="text-xl font-bold text-sky-blue mt-6">
            Hyperlinking to our Content
          </h2>
          <p>
            The following organizations may link to our Web site without prior
            written approval:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Government agencies</li>
            <li>Search engines</li>
            <li>News organizations</li>
            <li>Online directory distributors</li>
          </ul>

          <h2 className="text-xl font-bold text-sky-blue mt-6">
            Reservation of Rights
          </h2>
          <p>
            We reserve the right at any time and in its sole discretion to
            request that you remove all links or any particular link to our Web
            site.
          </p>

          <h2 className="text-xl font-bold text-sky-blue mt-6">
            Content Liability
          </h2>
          <p>
            We shall have no responsibility or liability for any content
            appearing on your Web site.
          </p>

          <h2 className="text-xl font-bold text-sky-blue mt-6">Disclaimer</h2>
          <p>
            To the maximum extent permitted by applicable law, we exclude all
            representations, warranties and conditions relating to our website
            and the use of this website.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default TermsOfService;
