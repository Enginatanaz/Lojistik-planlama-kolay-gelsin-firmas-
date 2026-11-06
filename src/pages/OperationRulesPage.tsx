import React from 'react';
import { OperationalRule } from '../types/logistics';
import { RuleManagementCenter } from '../components/RuleManagementCenter';

interface OperationRulesPageProps {
  rules: OperationalRule[];
  onVerifyRule: (ruleId: string, approved: boolean, operatorName: string) => void;
  onAddNewRule: (rule: Partial<OperationalRule>) => void;
}

export const OperationRulesPage: React.FC<OperationRulesPageProps> = ({
  rules,
  onVerifyRule,
  onAddNewRule
}) => {
  return (
    <div className="space-y-4">
      <RuleManagementCenter
        rules={rules}
        onVerifyRule={onVerifyRule}
        onAddNewRule={onAddNewRule}
      />
    </div>
  );
};
