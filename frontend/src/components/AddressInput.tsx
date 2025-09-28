import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MapPin, Search } from "lucide-react";
import { useChicagoCity } from "../../../app/providers/ChicagoCityProvider";
import { useOpenAI } from "../../../app/providers/OpenAIProvider";

interface AddressInputProps {
  onSubmit?: (address: string) => void;
}

const AddressInput = ({ onSubmit }: AddressInputProps) => {
  const [address, setAddress] = useState("");
  const [isValid, setIsValid] = useState(true);
  const { getZoneClass, loading } = useChicagoCity();
  const { sendPrompt } = useOpenAI();

  const validateChicagoAddress = (addr: string): boolean => {
    // Basic validation - ensure it's not empty and contains some street info
    return addr.trim().length > 5 && /\d/.test(addr);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateChicagoAddress(address)) {
      setIsValid(false);
      return;
    }

    setIsValid(true);

    try {

      const zoneLabel = await getZoneClass(address);
      if (!zoneLabel) throw new Error("No zoning label found for location");
      console.log(`Zoning for ${address}:`, zoneLabel);

      const response = await sendPrompt(address, zoneLabel);
      if (!response) throw new Error("No response from LLM");
      console.log("LLM Response:", response);

      // This isn't used currently
      if (onSubmit) onSubmit(address);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress(e.target.value);
    if (!isValid) setIsValid(true);
  };

  return (
    <div className="max-w-4xl mx-auto text-center">
      {/* Header */}
      <div className="mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-radius-lg mb-6">
          <MapPin className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
          ZONE IN
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Get comprehensive zoning codes, property details, and generate professional 
          PDF reports for any Chicago address instantly.
        </p>
      </div>

      {/* Input Form */}
      <div className="max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Input
              type="text"
              value={address}
              onChange={handleInputChange}
              placeholder="Enter your Chicago address... (e.g., 123 N State St, Chicago, IL)"
              className={`claude-input text-lg h-16 pr-16 ${
                !isValid ? "border-destructive focus:ring-destructive" : ""
              }`}
              autoFocus
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-muted-foreground" />
          </div>
          
          {!isValid && (
            <p className="text-destructive text-sm text-left">
              Please enter a valid Chicago address with street number and name.
            </p>
          )}
          
          <Button
            type="submit"
            className="btn-primary w-full h-14 text-lg"
            disabled={!address.trim() || loading}
          >
            {loading ? 'Searching…' : 'Get Property Information'}
          </Button>
        </form>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 mt-16 text-left">
          <div className="p-6 bg-card rounded-radius-lg shadow-soft">
            <div className="w-10 h-10 bg-primary/10 rounded-radius mb-4 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-card-foreground mb-2">
              Accurate Data
            </h3>
            <p className="text-muted-foreground text-sm">
              Direct integration with Chicago's Official City APIs for real-time property information.
            </p>
          </div>
          
          <div className="p-6 bg-card rounded-radius-lg shadow-soft">
            <div className="w-10 h-10 bg-primary/10 rounded-radius mb-4 flex items-center justify-center">
              <Search className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-card-foreground mb-2">
              Comprehensive Reports
            </h3>
            <p className="text-muted-foreground text-sm">
              Turning complex zoning codes into fast, accurate, and accessible insights.
            </p>
          </div>
          
          <div className="p-6 bg-card rounded-radius-lg shadow-soft">
            <div className="w-10 h-10 bg-primary/10 rounded-radius mb-4 flex items-center justify-center">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-card-foreground mb-2">
              PDF Download
            </h3>
            <p className="text-muted-foreground text-sm">
              Professional PDF reports ready for sharing and documentation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddressInput;