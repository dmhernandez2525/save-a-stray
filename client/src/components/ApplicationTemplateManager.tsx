import React, { Component } from "react";
import { Query, Mutation } from "@apollo/client/react/components";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Queries from "../graphql/queries";
import Mutations from "../graphql/mutations";
import { ShelterApplicationTemplatesResponse, ApplicationTemplate, TemplateField, TemplateFieldType } from "../types";

const { SHELTER_APPLICATION_TEMPLATES } = Queries;
const { CREATE_APPLICATION_TEMPLATE, DELETE_APPLICATION_TEMPLATE } = Mutations;

const FIELD_TYPES: { value: TemplateFieldType; label: string }[] = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Text Area" },
  { value: "select", label: "Select" },
  { value: "checkbox", label: "Checkbox" },
  { value: "number", label: "Number" }
];

interface ApplicationTemplateManagerProps {
  shelterId: string;
}

interface FieldFormState {
  label: string;
  fieldType: TemplateFieldType;
  required: boolean;
  options: string;
}

interface ApplicationTemplateManagerState {
  showForm: boolean;
  templateName: string;
  fields: FieldFormState[];
}

class ApplicationTemplateManager extends Component<ApplicationTemplateManagerProps, ApplicationTemplateManagerState> {
  constructor(props: ApplicationTemplateManagerProps) {
    super(props);
    this.state = {
      showForm: false,
      templateName: "",
      fields: [{ label: "", fieldType: "text", required: false, options: "" }]
    };
  }

  resetForm() {
    this.setState({
      showForm: false,
      templateName: "",
      fields: [{ label: "", fieldType: "text", required: false, options: "" }]
    });
  }

  addField() {
    this.setState((prev) => ({
      fields: [...prev.fields, { label: "", fieldType: "text", required: false, options: "" }]
    }));
  }

  removeField(index: number) {
    this.setState((prev) => ({
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  }

  updateField(index: number, key: keyof FieldFormState, value: string | boolean) {
    this.setState((prev) => {
      const fields = [...prev.fields];
      fields[index] = { ...fields[index], [key]: value };
      return { fields };
    });
  }

  renderTemplateCard(template: ApplicationTemplate) {
    return (
      <div key={template._id} className="border rounded-lg p-4 mb-3 bg-white">
        <div className="flex items-center justify-between mb-2">
          <p className="font-semibold text-gray-800">{template.name}</p>
          <Mutation
            mutation={DELETE_APPLICATION_TEMPLATE}
            refetchQueries={[{ query: SHELTER_APPLICATION_TEMPLATES, variables: { shelterId: this.props.shelterId } }]}
          >
            {(deleteTemplate: (options: { variables: { _id: string } }) => void) => (
              <button
                className="px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => deleteTemplate({ variables: { _id: template._id } })}
              >
                Delete
              </button>
            )}
          </Mutation>
        </div>
        <div className="space-y-1">
          {template.fields.map((field, idx) => (
            <div key={idx} className="text-sm text-gray-600 flex items-center gap-2">
              <span className="font-medium">{field.label}</span>
              <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{field.fieldType}</span>
              {field.required && <span className="text-xs text-red-500">required</span>}
              {field.options.length > 0 && (
                <span className="text-xs text-gray-400">[{field.options.join(", ")}]</span>
              )}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-400 mt-2">{template.fields.length} field{template.fields.length !== 1 ? "s" : ""}</p>
      </div>
    );
  }

  render() {
    const { shelterId } = this.props;
    const { showForm, templateName, fields } = this.state;

    return (
      <Card className="bg-white mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sky-blue font-capriola text-lg">Application Templates</CardTitle>
            <button
              className="px-3 py-1 text-sm bg-sky-500 text-white rounded hover:bg-sky-600"
              onClick={() => this.setState({ showForm: !showForm })}
            >
              {showForm ? "Cancel" : "New Template"}
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {showForm && (
            <Mutation
              mutation={CREATE_APPLICATION_TEMPLATE}
              refetchQueries={[{ query: SHELTER_APPLICATION_TEMPLATES, variables: { shelterId } }]}
              onCompleted={() => this.resetForm()}
            >
              {(createTemplate: (options: { variables: { shelterId: string; name: string; fields: Array<{ label: string; fieldType: string; required: boolean; options: string[] }> } }) => void) => (
                <form
                  className="mb-4 p-4 border rounded-lg bg-gray-50 space-y-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!templateName) return;
                    const validFields = fields.filter(f => f.label.trim());
                    if (validFields.length === 0) return;
                    createTemplate({
                      variables: {
                        shelterId,
                        name: templateName,
                        fields: validFields.map(f => ({
                          label: f.label,
                          fieldType: f.fieldType,
                          required: f.required,
                          options: f.fieldType === "select" ? f.options.split(",").map(o => o.trim()).filter(Boolean) : []
                        }))
                      }
                    });
                  }}
                >
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Template Name *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border rounded text-gray-800"
                      value={templateName}
                      onChange={(e) => this.setState({ templateName: e.target.value })}
                      placeholder="e.g. Dog Adoption Application"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Fields</label>
                    {fields.map((field, idx) => (
                      <div key={idx} className="flex gap-2 mb-2 items-start">
                        <input
                          type="text"
                          className="flex-1 px-2 py-1 border rounded text-sm text-gray-800"
                          value={field.label}
                          onChange={(e) => this.updateField(idx, "label", e.target.value)}
                          placeholder="Field label"
                        />
                        <select
                          className="px-2 py-1 border rounded text-sm text-gray-800"
                          value={field.fieldType}
                          onChange={(e) => this.updateField(idx, "fieldType", e.target.value)}
                        >
                          {FIELD_TYPES.map(ft => (
                            <option key={ft.value} value={ft.value}>{ft.label}</option>
                          ))}
                        </select>
                        <label className="flex items-center gap-1 text-sm text-gray-600">
                          <input
                            type="checkbox"
                            checked={field.required}
                            onChange={(e) => this.updateField(idx, "required", e.target.checked)}
                          />
                          Req
                        </label>
                        {field.fieldType === "select" && (
                          <input
                            type="text"
                            className="flex-1 px-2 py-1 border rounded text-sm text-gray-800"
                            value={field.options}
                            onChange={(e) => this.updateField(idx, "options", e.target.value)}
                            placeholder="Options (comma-separated)"
                          />
                        )}
                        {fields.length > 1 && (
                          <button
                            type="button"
                            className="text-red-500 text-sm px-1"
                            onClick={() => this.removeField(idx)}
                          >
                            X
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      className="text-sm text-sky-500 hover:text-sky-600"
                      onClick={() => this.addField()}
                    >
                      + Add Field
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-500 text-white rounded hover:bg-sky-600"
                  >
                    Create Template
                  </button>
                </form>
              )}
            </Mutation>
          )}

          <Query<ShelterApplicationTemplatesResponse> query={SHELTER_APPLICATION_TEMPLATES} variables={{ shelterId }}>
            {({ loading, error, data }) => {
              if (loading) return <p className="text-gray-500 animate-pulse">Loading templates...</p>;
              if (error) return <p className="text-red-500">Error loading templates</p>;

              const templates = data?.shelterApplicationTemplates || [];

              if (templates.length === 0) {
                return <p className="text-gray-500 text-sm">No application templates yet. Create one to customize your adoption applications.</p>;
              }

              return (
                <div>
                  {templates.map((template) => this.renderTemplateCard(template))}
                </div>
              );
            }}
          </Query>
        </CardContent>
      </Card>
    );
  }
}

export default ApplicationTemplateManager;
