"use client";

import { Button, ButtonProps } from "@heroui/button";
import {
    Modal,
    ModalBody,
    ModalContent,
    ModalFooter,
    ModalHeader,
    useDisclosure,
} from "@heroui/modal";
import { Check, X } from "react-feather";

import RunningButton from "./RunningButton";

export default function ConfirmationButton({
    title,
    description,
    onConfirm,
    ...buttonProps
}: {
    title: string;
    description: string;
    onConfirm: () => void;
} & Omit<ButtonProps, "onPress">) {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (
        <>
            <Button {...buttonProps} onPress={onOpen} />
            <Modal
                isDismissable={false}
                isOpen={isOpen}
                onOpenChange={onOpenChange}
            >
                <ModalContent className="overflow-visible">
                    {(onClose) => (
                        <>
                            <ModalHeader>{title}</ModalHeader>
                            <ModalBody>{description}</ModalBody>
                            <ModalFooter className="gap-4">
                                <Button
                                    isIconOnly
                                    color="primary"
                                    data-testid="cancel-button"
                                    onPress={onClose}
                                >
                                    <X />
                                </Button>
                                <RunningButton
                                    isIconOnly
                                    color="danger"
                                    data-testid="confirm-button"
                                    delay={3000}
                                    onPress={() => {
                                        onClose();
                                        onConfirm();
                                    }}
                                >
                                    <Check />
                                </RunningButton>
                            </ModalFooter>
                        </>
                    )}
                </ModalContent>
            </Modal>
        </>
    );
}
