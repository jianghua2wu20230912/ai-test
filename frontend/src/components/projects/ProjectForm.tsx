import React, { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { Project, ProjectCreate, ProjectUpdate } from '../../types/project'; // Assuming Project type includes all fields

interface ProjectFormProps {
  visible: boolean;
  onCancel: () => void;
  onFinish: (values: ProjectCreate | ProjectUpdate) => void; // Combined type for flexibility
  initialValues?: Project | null; // Use Project for initialValues as it contains all fields
  loading?: boolean;
}

const ProjectForm: React.FC<ProjectFormProps> = ({
  visible,
  onCancel,
  onFinish,
  initialValues,
  loading = false,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        // Ensure all form fields are present in initialValues or provide defaults
        form.setFieldsValue({
          name: initialValues.name,
          description: initialValues.description || '', // Default to empty string if undefined/null
          // owner_id is not typically edited directly in this form, but handled by backend/service layer
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      onFinish(values);
    } catch (errorInfo) {
      console.log('Failed:', errorInfo);
    }
  };

  return (
    <Modal
      title={initialValues ? 'Edit Project' : 'Create New Project'}
      open={visible} // Changed from 'visible' to 'open' for AntD v5+
      onCancel={onCancel}
      confirmLoading={loading}
      footer={[
        <Button key="back" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" loading={loading} onClick={handleSubmit}>
          {initialValues ? 'Save Changes' : 'Create'}
        </Button>,
      ]}
      destroyOnClose // Added for consistency
    >
      <Form form={form} layout="vertical" name="project_form">
        <Form.Item
          name="name"
          label="Project Name"
          rules={[{ required: true, message: 'Please input the project name!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
          // rules={[{ required: false }]} // Optional field
        >
          <Input.TextArea rows={4} />
        </Form.Item>
        {/* owner_id is generally not set/edited via a simple form field by regular users.
            It's typically derived from the logged-in user on create,
            or managed through a separate interface (e.g., user selector) for updates if allowed.
            For this form, we'll omit direct editing of owner_id.
        */}
      </Form>
    </Modal>
  );
};

export default ProjectForm;
