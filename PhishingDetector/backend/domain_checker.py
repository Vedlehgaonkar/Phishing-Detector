from difflib import SequenceMatcher

trusted_domains = [
    "google.com",
    "facebook.com",
    "github.com",
    "amazon.com",
    "microsoft.com",
    "youtube.com"
]

def check_domain(domain):

    for trusted in trusted_domains:

        similarity = SequenceMatcher(
            None,
            domain,
            trusted
        ).ratio()

        if (
            similarity > 0.75
            and domain != trusted
        ):

            return {
                "suspicious": True,
                "similar_to": trusted,
                "score": round(similarity * 100, 2)
            }

    return {
        "suspicious": False,
        "similar_to": None,
        "score": 0
    }