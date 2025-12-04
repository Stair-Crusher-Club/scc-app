import React from 'react';

import {SccButton} from '@/components/atoms';
import {Image, Modal, Platform, ScrollView, Text, View} from 'react-native';

import {useSafeAreaInsets} from 'react-native-safe-area-context';
import type {GuideContent} from '../constants';

interface GuideModalProps {
  visible: boolean;
  guideContent: GuideContent;
  onDismissPermanently: () => void;
  onConfirm: () => void;
  onRequestClose: () => void;
}

export default function GuideModal({
  visible,
  guideContent,
  onDismissPermanently,
  onConfirm,
  onRequestClose,
}: GuideModalProps) {
  const insets = useSafeAreaInsets();

  if (!guideContent) {
    return null;
  }

  const {image, title, steps, additionalInfo} = guideContent;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onRequestClose}>
      <View className="flex-1 bg-white">
        <ScrollView contentContainerClassName="flex-grow">
          <View className="flex-1 gap-[24px]">
            {image && (
              <View className="max-h-[260px]">
                <Image
                  source={image}
                  className="w-full h-full"
                  resizeMode="cover"
                />
              </View>
            )}

            {/* 설명 섹션 */}
            <View className="px-[20px] pb-[40px] gap-[20px]">
              {/* 타이틀 */}
              <Text className="font-pretendard-semibold text-gray-80 text-center text-[22px] leading-[30px]">
                {title}
              </Text>

              {/* 순서 단계 */}
              {steps && steps.length > 0 && (
                <View>
                  {steps.map((step, index) => (
                    <React.Fragment key={step.number}>
                      <View className="flex-row gap-[10px] items-center">
                        <View className="w-[24px] h-[24px] rounded-[12px] bg-gray-15 items-center justify-center">
                          <Text className="font-pretendard-medium text-gray-80 text-[13px]">
                            {step.number}
                          </Text>
                        </View>
                        <Text className="flex-1 font-pretendard-medium text-gray-80 text-[18px] leading-[26px]">
                          {step.description}
                        </Text>
                      </View>
                      {index < steps.length - 1 && (
                        <View className="bg-gray-15 ml-[11px] mt-[4px] mb-[4px] w-[2px] h-[20px]" />
                      )}
                    </React.Fragment>
                  ))}
                </View>
              )}

              {/* 추가 정보 */}
              {additionalInfo && (
                <Text className="font-pretendard-medium text-gray-90 bg-gray-10 rounded-[14px] p-[12px] text-[14px] leading-[22px]">
                  {additionalInfo}
                </Text>
              )}
            </View>
          </View>
        </ScrollView>

        <View
          className="flex-row px-[20px] pt-[12px] gap-[8px] pb-[12px]"
          style={{
            paddingBottom: Platform.OS === 'ios' ? insets.bottom : undefined,
          }}>
          <SccButton
            elementName="guide_modal_dismiss"
            text="다시보지 않기"
            onPress={onDismissPermanently}
            buttonColor="gray10"
            textColor="black"
            style={{maxWidth: 132, width: '100%'}}
          />
          <SccButton
            elementName="guide_modal_confirm"
            text="확인했어요!"
            onPress={onConfirm}
            buttonColor="brandColor"
            textColor="white"
            style={{flex: 1}}
          />
        </View>
      </View>
    </Modal>
  );
}
