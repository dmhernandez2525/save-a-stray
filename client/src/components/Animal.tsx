import React, { Component, FormEvent } from "react";
import { Mutation } from "@apollo/client/react/components";
import Mutations from "../graphql/mutations";
import { withRouter, WithRouterProps } from "../util/withRouter";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { CreateAnimalResponse, AnimalFormState } from "../types";

const { CREATE_ANIMAL } = Mutations;

interface AnimalProps extends WithRouterProps {}

interface AnimalState extends AnimalFormState {}

class NewAnimal extends Component<AnimalProps, AnimalState> {
  constructor(props: AnimalProps) {
    super(props);
    this.state = {
      name: "",
      type: "",
      age: "",
      sex: "M",
      color: "",
      description: "",
      image: "",
      images: [],
      video: "",
      application: "",
    };
  }

  update(field: keyof Omit<AnimalState, 'images'>) {
    return (e: React.ChangeEvent<HTMLInputElement>) =>
      this.setState({ [field]: e.target.value } as unknown as Pick<AnimalState, keyof AnimalState>);
  }

  render() {
    return (
      <Mutation<CreateAnimalResponse>
        mutation={CREATE_ANIMAL}
        onCompleted={(data) => {
          localStorage.setItem("Animal", JSON.stringify(data.newAnimal));
          this.props.history.push("/");
        }}
      >
        {(createAnimal, { loading, error }) => {
          if (loading)
            return (
              <p className="text-white font-capriola animate-pulse">
                Loading...
              </p>
            );

          return (
            <div className="col-start-1 col-end-6 md:col-start-2 md:col-end-5 row-start-1 md:row-start-2 flex justify-center items-start p-4 pb-20 md:pb-4">
              <Card className="w-full max-w-lg bg-card">
                <CardHeader>
                  <CardTitle className="text-sky-blue font-capriola text-2xl text-center">
                    Put up an animal for adoption
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form
                    className="flex flex-col gap-4"
                    onSubmit={(e: FormEvent) => {
                      e.preventDefault();
                      createAnimal({
                        variables: {
                          name: this.state.name,
                          type: this.state.type,
                          age: parseInt(this.state.age),
                          sex: this.state.sex,
                          color: this.state.color,
                          description: this.state.description,
                          image: this.state.image,
                          images: this.state.images.filter(url => url.trim() !== ""),
                          video: this.state.video,
                          applications: this.state.application,
                        },
                      });
                    }}
                  >
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        value={this.state.name}
                        onChange={this.update("name")}
                        placeholder="Name"
                        className="bg-blue-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="type">Type</Label>
                      <Input
                        id="type"
                        value={this.state.type}
                        onChange={this.update("type")}
                        placeholder="Type (Dogs, Cats, Other)"
                        className="bg-blue-50"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={this.state.age}
                          onChange={this.update("age")}
                          placeholder="Age"
                          className="bg-blue-50"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Sex</Label>
                        <div className="flex gap-4 items-center mt-2">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="sex"
                              value="M"
                              checked={this.state.sex === "M"}
                              onChange={this.update("sex")}
                              className="w-4 h-4 text-sky-blue"
                            />
                            Male
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              name="sex"
                              value="F"
                              checked={this.state.sex === "F"}
                              onChange={this.update("sex")}
                              className="w-4 h-4 text-sky-blue"
                            />
                            Female
                          </label>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Input
                        id="color"
                        value={this.state.color}
                        onChange={this.update("color")}
                        placeholder="Color"
                        className="bg-blue-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={this.state.description}
                        onChange={this.update("description")}
                        placeholder="Description"
                        className="bg-blue-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image">Primary Image URL</Label>
                      <Input
                        id="image"
                        value={this.state.image}
                        onChange={this.update("image")}
                        placeholder="Primary Image URL"
                        className="bg-blue-50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Additional Images</Label>
                      {this.state.images.map((url, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            value={url}
                            onChange={(e) => {
                              const newImages = [...this.state.images];
                              newImages[idx] = e.target.value;
                              this.setState({ images: newImages });
                            }}
                            placeholder={`Image URL ${idx + 2}`}
                            className="bg-blue-50 flex-1"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              const newImages = this.state.images.filter((_, i) => i !== idx);
                              this.setState({ images: newImages });
                            }}
                            className="text-red-500 hover:text-red-700"
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => this.setState({ images: [...this.state.images, ""] })}
                        className="text-sky-blue"
                      >
                        + Add Image
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="video">Video URL</Label>
                      <Input
                        id="video"
                        value={this.state.video}
                        onChange={this.update("video")}
                        placeholder="Video URL"
                        className="bg-blue-50"
                      />
                    </div>
                    <Button variant="salmon" size="lg" type="submit" className="w-full mt-4">
                      Add Animal
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          );
        }}
      </Mutation>
    );
  }
}

export default withRouter(NewAnimal);
