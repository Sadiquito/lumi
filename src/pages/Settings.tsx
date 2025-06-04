
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Phone, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";

const Settings = () => {
  const navigate = useNavigate();
  const [callTime, setCallTime] = useState("07:30");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [retryEnabled, setRetryEnabled] = useState(true);
  const [maxRetries, setMaxRetries] = useState("3");
  const [preferredChannel, setPreferredChannel] = useState("phone");

  return (
    <div className="min-h-screen bg-warm-gradient">
      {/* Header */}
      <div className="flex items-center p-4 md:p-6">
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => navigate('/journal')}
          className="text-lumi-wood hover:bg-lumi-wood/10 mr-3"
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <h1 className="text-2xl font-medium text-lumi-wood">when should i call you?</h1>
      </div>

      <div className="max-w-2xl mx-auto px-4 md:px-6 pb-8">
        <div className="space-y-6">
          {/* Call Time */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lumi-wood text-lg">your daily check-in time</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-lumi-wood/80">what time works best for you?</Label>
                <Input
                  type="time"
                  value={callTime}
                  onChange={(e) => setCallTime(e.target.value)}
                  className="border-lumi-wood/20 focus:border-lumi-aqua"
                />
                <p className="text-sm text-lumi-wood/60">
                  i'll call you every day at this time. we can always adjust this later.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Phone Number */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lumi-wood text-lg">how can i reach you?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-lumi-wood/80">your phone number</Label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="border-lumi-wood/20 focus:border-lumi-aqua"
                />
              </div>
              
              <div className="space-y-3">
                <Label className="text-lumi-wood/80">how would you prefer i reach out?</Label>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="phone"
                      name="channel"
                      value="phone"
                      checked={preferredChannel === "phone"}
                      onChange={(e) => setPreferredChannel(e.target.value)}
                      className="text-lumi-wood focus:ring-lumi-aqua"
                    />
                    <label htmlFor="phone" className="flex items-center space-x-2 text-lumi-wood">
                      <Phone className="w-4 h-4" />
                      <span>phone call</span>
                    </label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <input
                      type="radio"
                      id="whatsapp"
                      name="channel"
                      value="whatsapp"
                      checked={preferredChannel === "whatsapp"}
                      onChange={(e) => setPreferredChannel(e.target.value)}
                      className="text-lumi-wood focus:ring-lumi-aqua"
                    />
                    <label htmlFor="whatsapp" className="flex items-center space-x-2 text-lumi-wood">
                      <MessageSquare className="w-4 h-4" />
                      <span>whatsapp</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Retry Settings */}
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="text-lumi-wood text-lg">if you miss my call</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label className="text-lumi-wood/80">should i try calling again?</Label>
                  <p className="text-sm text-lumi-wood/60">
                    life happens. i understand if you can't always answer.
                  </p>
                </div>
                <Switch
                  checked={retryEnabled}
                  onCheckedChange={setRetryEnabled}
                />
              </div>
              
              {retryEnabled && (
                <div className="space-y-2">
                  <Label className="text-lumi-wood/80">how many times should i retry?</Label>
                  <Select value={maxRetries} onValueChange={setMaxRetries}>
                    <SelectTrigger className="border-lumi-wood/20 focus:border-lumi-aqua">
                      <SelectValue placeholder="Select retry count" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 time</SelectItem>
                      <SelectItem value="2">2 times</SelectItem>
                      <SelectItem value="3">3 times (recommended)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-lumi-wood/60">
                    i'll space these out throughout the day, so don't worry about being bothered.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button 
            className="w-full bg-lumi-wood hover:bg-lumi-wood/90 text-white py-3 text-lg font-medium rounded-xl"
          >
            save my preferences
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
