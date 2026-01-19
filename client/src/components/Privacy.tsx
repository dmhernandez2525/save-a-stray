import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const Privacy: React.FC = () => {
  return (
    <div className="col-start-2 col-end-5 row-start-2 overflow-y-auto p-4">
      <Card className="bg-white max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-sky-blue font-capriola text-3xl">
            Privacy Policy
          </CardTitle>
          <p className="text-muted-foreground">Effective date: October 08, 2019</p>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none text-gray-700 space-y-4">
          <p>
            Save A Stray ("us", "we", or "our") operates the
            https://save-a-stray.herokuapp.com website (the "Service").
          </p>
          <p>
            This page informs you of our policies regarding the collection, use,
            and disclosure of personal data when you use our Service and the
            choices you have associated with that data.
          </p>
          <p>
            We use your data to provide and improve the Service. By using the
            Service, you agree to the collection and use of information in
            accordance with this policy.
          </p>

          <h2 className="text-xl font-bold text-sky-blue mt-6">
            Information Collection And Use
          </h2>
          <p>
            We collect several different types of information for various
            purposes to provide and improve our Service to you.
          </p>

          <h3 className="text-lg font-semibold mt-4">Personal Data</h3>
          <p>
            While using our Service, we may ask you to provide us with certain
            personally identifiable information that can be used to contact or
            identify you ("Personal Data"). Personally identifiable information
            may include, but is not limited to:
          </p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Email address</li>
            <li>First name and last name</li>
            <li>Phone number</li>
            <li>Address, State, Province, ZIP/Postal code, City</li>
            <li>Cookies and Usage Data</li>
          </ul>

          <h3 className="text-lg font-semibold mt-4">Usage Data</h3>
          <p>
            We may also collect information how the Service is accessed and used
            ("Usage Data").
          </p>

          <h3 className="text-lg font-semibold mt-4">
            Tracking & Cookies Data
          </h3>
          <p>
            We use cookies and similar tracking technologies to track the
            activity on our Service and hold certain information.
          </p>

          <h2 className="text-xl font-bold text-sky-blue mt-6">Use of Data</h2>
          <p>Save A Stray uses the collected data for various purposes:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>To provide and maintain the Service</li>
            <li>To notify you about changes to our Service</li>
            <li>To provide customer care and support</li>
            <li>To monitor the usage of the Service</li>
            <li>To detect, prevent and address technical issues</li>
          </ul>

          <h2 className="text-xl font-bold text-sky-blue mt-6">
            Security Of Data
          </h2>
          <p>
            The security of your data is important to us, but remember that no
            method of transmission over the Internet, or method of electronic
            storage is 100% secure.
          </p>

          <h2 className="text-xl font-bold text-sky-blue mt-6">Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact
            us by phone: 217-508-9193
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Privacy;
