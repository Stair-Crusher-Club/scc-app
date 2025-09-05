import React, {useState} from 'react';
import {View} from 'react-native';

import {MOBILITY_TOOL_OPTIONS} from '@/constant/mobilityTool';
import {UserMobilityToolDto} from '@/generated-sources/openapi';
import AskBottomSheet from '@/screens/SignupScreen/components/AskBottomSheet';
import SelectableItem from '@/screens/SignupScreen/components/SelectableItem';

interface UserMobilityToolsFormProps {
  value: UserMobilityToolDto[];
  onChangeValue: (value: UserMobilityToolDto[]) => Promise<void>;
  onSubmit?: () => void;
}

const isNotUsingMobilityTool = (
  value: UserMobilityToolDto[] | UserMobilityToolDto,
) =>
  Array.isArray(value)
    ? value.length === 1 &&
      (value[0] === UserMobilityToolDto.None ||
        value[0] === UserMobilityToolDto.FriendOfToolUser)
    : value === UserMobilityToolDto.None ||
      value === UserMobilityToolDto.FriendOfToolUser;

export default function UserMobilityToolsForm({
  value,
  onChangeValue,
  onSubmit,
}: UserMobilityToolsFormProps) {
  const [isAskBottomSheetVisible, setIsAskBottomSheetVisible] = useState(false);

  return (
    <>
      <View
        style={{
          paddingHorizontal: 20,
          flexDirection: 'column',
          gap: 12,
          marginBottom: 12,
        }}>
        {MOBILITY_TOOL_OPTIONS.map(option => (
          <SelectableItem
            key={option.value}
            isSelected={
              isNotUsingMobilityTool(option.value)
                ? isNotUsingMobilityTool(value)
                : value.includes(option.value)
            }
            onPress={() => {
              const prev = value;
              const pressed = option.value;
              if (
                isNotUsingMobilityTool(prev) &&
                !isNotUsingMobilityTool(pressed)
              ) {
                onChangeValue([pressed]);
                return;
              }

              if (
                !isNotUsingMobilityTool(prev) &&
                isNotUsingMobilityTool(pressed)
              ) {
                setIsAskBottomSheetVisible(true);
                onChangeValue([UserMobilityToolDto.None]);
                return;
              }

              if (value.includes(option.value)) {
                onChangeValue(value.filter(tool => tool !== option.value));
              } else {
                onChangeValue([...value, option.value]);
              }
            }}
            text={option.label}
            elementName="user_mobility_tool_option"
          />
        ))}
      </View>

      <AskBottomSheet
        isVisible={isAskBottomSheetVisible}
        onClose={isAgree => {
          setIsAskBottomSheetVisible(false);
          onChangeValue([
            isAgree
              ? UserMobilityToolDto.FriendOfToolUser
              : UserMobilityToolDto.None,
          ]);
          onSubmit?.();
        }}
      />
    </>
  );
}
