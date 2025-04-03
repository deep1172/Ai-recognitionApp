import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="container mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold mb-8">Contact Us</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <Card>
          <CardHeader>
            <CardTitle>Send us a message</CardTitle>
            <CardDescription>Fill out the form below and we'll get back to you as soon as possible.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Your email" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input id="subject" placeholder="Subject" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea id="message" placeholder="Your message" rows={5} />
              </div>
              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
            <CardDescription>Here's how you can reach us directly.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <Mail className="h-6 w-6 text-gray-400 mt-1" />
                <div>
                  <h3 className="font-medium">Email</h3>
                  <p className="text-gray-600">support@airecognition.com</p>
                  <p className="text-gray-600">info@airecognition.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <Phone className="h-6 w-6 text-gray-400 mt-1" />
                <div>
                  <h3 className="font-medium">Phone</h3>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                  <p className="text-gray-600">Mon-Fri, 9am-5pm EST</p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <MapPin className="h-6 w-6 text-gray-400 mt-1" />
                <div>
                  <h3 className="font-medium">Address</h3>
                  <p className="text-gray-600">123 AI Boulevard</p>
                  <p className="text-gray-600">Tech City, CA 94103</p>
                  <p className="text-gray-600">United States</p>
                </div>
              </div>

              <div className="border-t pt-6 mt-6">
                <h3 className="font-medium mb-2">Office Hours</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="font-medium">Monday - Friday</p>
                    <p className="text-gray-600">9:00 AM - 5:00 PM</p>
                  </div>
                  <div>
                    <p className="font-medium">Saturday</p>
                    <p className="text-gray-600">10:00 AM - 2:00 PM</p>
                  </div>
                  <div>
                    <p className="font-medium">Sunday</p>
                    <p className="text-gray-600">Closed</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
          <CardDescription>Find quick answers to common questions.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">What AI models do you use?</h3>
              <p className="text-gray-600">
                We use state-of-the-art transformer models including Vision Transformers for images, BERT and T5 for
                text, Whisper and Wav2Vec2 for voice, and specialized video transformers.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Is my data secure?</h3>
              <p className="text-gray-600">
                Yes, we take data security very seriously. All data is encrypted in transit and at rest. We do not share
                your data with third parties, and you can request deletion at any time.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">Do you offer API access?</h3>
              <p className="text-gray-600">
                Yes, we provide API access for all our services. Contact our sales team for more information about API
                pricing and integration options.
              </p>
            </div>

            <div>
              <h3 className="font-medium mb-2">What file formats do you support?</h3>
              <p className="text-gray-600">
                For images: JPG, PNG, WebP, HEIC. For audio: MP3, WAV, M4A. For video: MP4, MOV, AVI, WebM. Text can be
                entered directly or uploaded as TXT, PDF, or DOCX files.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

