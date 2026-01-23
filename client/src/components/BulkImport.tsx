import React, { Component } from "react";
import { Mutation } from "@apollo/client/react/components";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Mutations from "../graphql/mutations";
import Queries from "../graphql/queries";
import { parseCsv, ParsedAnimal } from "../util/parseCsv";

const { BULK_CREATE_ANIMALS } = Mutations;
const { FETCH_SHELTER } = Queries;

interface BulkImportProps {
  shelterId: string;
}

interface BulkImportState {
  animals: ParsedAnimal[];
  errors: string[];
  importing: boolean;
  result: string;
}

class BulkImport extends Component<BulkImportProps, BulkImportState> {
  constructor(props: BulkImportProps) {
    super(props);
    this.state = { animals: [], errors: [], importing: false, result: '' };
  }

  handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const { animals, errors } = parseCsv(content);
      this.setState({ animals, errors, result: '' });
    };
    reader.readAsText(file);
  }

  render() {
    const { shelterId } = this.props;
    const { animals, errors, importing, result } = this.state;

    return (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle className="text-sky-blue font-capriola text-lg">Bulk Import Animals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            Upload a CSV file with columns: name, type, breed, age, sex, color, description, image, video
          </p>

          <input
            type="file"
            accept=".csv"
            onChange={(e) => this.handleFileChange(e)}
            className="block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-sky-blue hover:file:bg-blue-100 mb-4"
          />

          {errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded p-3 mb-4">
              <p className="text-red-700 font-medium text-sm mb-1">Errors found:</p>
              {errors.map((err, idx) => (
                <p key={idx} className="text-red-600 text-xs">{err}</p>
              ))}
            </div>
          )}

          {animals.length > 0 && (
            <>
              <div className="border rounded-lg overflow-x-auto mb-4">
                <table className="w-full text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-1 text-left font-medium text-gray-700">Name</th>
                      <th className="px-2 py-1 text-left font-medium text-gray-700">Type</th>
                      <th className="px-2 py-1 text-left font-medium text-gray-700">Breed</th>
                      <th className="px-2 py-1 text-left font-medium text-gray-700">Age</th>
                      <th className="px-2 py-1 text-left font-medium text-gray-700">Sex</th>
                      <th className="px-2 py-1 text-left font-medium text-gray-700">Color</th>
                    </tr>
                  </thead>
                  <tbody>
                    {animals.map((animal, idx) => (
                      <tr key={idx} className="border-t">
                        <td className="px-2 py-1 text-gray-800">{animal.name}</td>
                        <td className="px-2 py-1 text-gray-800">{animal.type}</td>
                        <td className="px-2 py-1 text-gray-800">{animal.breed || '-'}</td>
                        <td className="px-2 py-1 text-gray-800">{animal.age}</td>
                        <td className="px-2 py-1 text-gray-800">{animal.sex}</td>
                        <td className="px-2 py-1 text-gray-800">{animal.color}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center gap-3">
                <Mutation
                  mutation={BULK_CREATE_ANIMALS}
                  refetchQueries={[{ query: FETCH_SHELTER, variables: { _id: shelterId } }]}
                  onCompleted={(data: { bulkCreateAnimals: Array<{ _id: string }> }) => {
                    this.setState({
                      importing: false,
                      result: `Successfully imported ${data.bulkCreateAnimals.length} animals.`,
                      animals: [],
                      errors: []
                    });
                  }}
                  onError={(err: Error) => {
                    this.setState({ importing: false, errors: [err.message] });
                  }}
                >
                  {(bulkCreate: (opts: { variables: { animals: ParsedAnimal[]; shelterId: string } }) => void) => (
                    <Button
                      variant="salmon"
                      disabled={importing}
                      onClick={() => {
                        this.setState({ importing: true });
                        bulkCreate({ variables: { animals, shelterId } });
                      }}
                    >
                      {importing ? 'Importing...' : `Import ${animals.length} Animals`}
                    </Button>
                  )}
                </Mutation>
                <Button variant="outline" onClick={() => this.setState({ animals: [], errors: [], result: '' })}>
                  Clear
                </Button>
              </div>
            </>
          )}

          {result && (
            <p className="text-green-600 font-medium text-sm mt-3">{result}</p>
          )}
        </CardContent>
      </Card>
    );
  }
}

export default BulkImport;
