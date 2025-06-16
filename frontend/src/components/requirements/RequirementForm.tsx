import React, { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { Requirement, RequirementCreate, RequirementUpdate } from '../../types/requirement';

interface RequirementFormProps {
  visible: boolean;
  onCancel: () => void;
  onFinish: (values: RequirementCreate | RequirementUpdate) => void;
  initialValues?: Requirement | null; // Use Requirement for initialValues
  loading?: boolean;
  projectId?: number | null; // To associate with a project if creating
}

const RequirementForm: React.FC<RequirementFormProps> = ({
  visible,
  onCancel,
  onFinish,
  initialValues,
  loading = false,
  projectId, // Not directly used in form fields, but onFinish might need it for RequirementCreate
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue({
          title: initialValues.title,
          // project_id is usually fixed for an existing requirement or set on create
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      // If creating, add projectId. The form only has 'title'.
      // The service for createRequirement expects { title, project_id }
      if (!initialValues && projectId) {
        onFinish({ ...values, project_id: projectId });
      } else {
        onFinish(values as RequirementUpdate); // For update, only title might be sent
      }
    } catch (errorInfo) {
      console.log('Form validation Failed:', errorInfo);
    }
  };

  return (
    <Modal
      title={initialValues ? 'Edit Requirement' : 'Create New Requirement'}
      open={visible}
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
    >
      <Form form={form} layout="vertical" name="requirement_form">
        <Form.Item
          name="title"
          label="Requirement Title"
          rules={[{ required: true, message: 'Please input the requirement title!' }]}
        >
          <Input.TextArea rows={3} />
        </Form.Item>
        {/* project_id is not part of this form as it's contextual (selected project)
            or fixed for an existing requirement. It's passed to onFinish for create.
        */}
      </Form>
    </Modal>
  );
};

export default RequirementForm;
