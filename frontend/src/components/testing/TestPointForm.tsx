import React, { useEffect } from 'react';
import { Modal, Form, Input, Button } from 'antd';
import { TestPoint, TestPointCreate, TestPointUpdate } from '../../types/testManagement';

interface TestPointFormProps {
  visible: boolean;
  onCancel: () => void;
  onFinish: (values: TestPointCreate | TestPointUpdate) => void;
  initialValues?: TestPoint | null;
  loading?: boolean;
  requirementVersionId?: number | null; // To associate with a req version if creating
}

const TestPointForm: React.FC<TestPointFormProps> = ({
  visible,
  onCancel,
  onFinish,
  initialValues,
  loading = false,
  requirementVersionId,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (visible) {
      if (initialValues) {
        form.setFieldsValue({
          name: initialValues.name,
          description: initialValues.description || '',
        });
      } else {
        form.resetFields();
      }
    }
  }, [visible, initialValues, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (!initialValues && requirementVersionId) {
        // For creation, add requirement_version_id
        onFinish({ ...values, requirement_version_id: requirementVersionId });
      } else {
        // For update, only send fields that can be updated (name, description)
        onFinish(values as TestPointUpdate);
      }
    } catch (errorInfo) {
      console.log('Form validation Failed:', errorInfo);
    }
  };

  return (
    <Modal
      title={initialValues ? 'Edit Test Point' : 'Create New Test Point'}
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
      destroyOnClose
    >
      <Form form={form} layout="vertical" name="test_point_form">
        <Form.Item
          name="name"
          label="Test Point Name"
          rules={[{ required: true, message: 'Please input the test point name!' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="description"
          label="Description"
        >
          <Input.TextArea rows={3} />
        </Form.Item>
        {/* requirement_version_id is contextual and passed to onFinish for create */}
      </Form>
    </Modal>
  );
};

export default TestPointForm;
