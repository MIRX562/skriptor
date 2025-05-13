import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { Tailwind } from "@react-email/tailwind";

interface VerificationEmailProps {
  username?: string;
  userEmail?: string;
  verificationUrl?: string;
}

export const VerificationEmail = ({
  username = "User",
  userEmail = "user@example.com",
  verificationUrl = "https://whisper-transcription.com/auth/verify-email?token=123456789",
}: VerificationEmailProps) => {
  const previewText = `Verify your email address for Whisper`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-slate-50 my-auto mx-auto font-sans">
          <Container className="border border-solid border-slate-200 rounded-lg p-8 my-10 mx-auto max-w-[600px] bg-white">
            <Section className="text-center">
              <Img
                src="https://placeholder.svg?height=48&width=48&text=W"
                width="48"
                height="48"
                alt="Whisper Logo"
                className="mx-auto"
              />
            </Section>
            <Heading className="text-2xl font-bold text-center text-slate-800 my-6">
              Verify your email address - {userEmail}
            </Heading>
            <Text className="text-slate-600 mb-6">Hello {username},</Text>
            <Text className="text-slate-600 mb-6">
              Thank you for signing up for Whisper! To complete your
              registration and access all features, please verify your email
              address by clicking the button below:
            </Text>
            <Section className="text-center mb-8">
              <Button
                className="bg-teal-600 text-white rounded-md px-6 py-3 font-medium text-sm no-underline"
                href={verificationUrl}
              >
                Verify Email Address
              </Button>
            </Section>
            <Text className="text-slate-600 mb-6">
              If the button above doesn&apos;t work, you can also verify your
              email by copying and pasting the following link into your browser:
            </Text>
            <Text className="text-xs text-slate-500 break-all mb-6">
              <Link
                href={verificationUrl}
                className="text-teal-600 no-underline"
              >
                {verificationUrl}
              </Link>
            </Text>
            <Text className="text-slate-600 mb-6">
              This verification link will expire in 24 hours. If you didn&apos;t
              create an account with Whisper, you can safely ignore this email.
            </Text>
            <Hr className="border-slate-200 my-6" />
            <Text className="text-xs text-slate-500 text-center">
              © 2023 Whisper. All rights reserved.
              <br />
              123 Transcription Lane, Audio City, AC 12345
            </Text>
            <Text className="text-xs text-slate-500 text-center">
              <Link href="#" className="text-teal-600 no-underline">
                Privacy Policy
              </Link>{" "}
              •{" "}
              <Link href="#" className="text-teal-600 no-underline">
                Terms of Service
              </Link>
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

export default VerificationEmail;
