import { Grid, Card, Text, Button, Group } from '@mantine/core';

function Manage() {
    return (
        <div className="p-4">
            <h1 className="text-left text-2xl font-bold mb-4">Current Projects</h1>
            <Grid>
                <Grid.Col span={4}>
                    <Card shadow="sm" padding="lg" radius="md" withBorder>
                        <Text weight={500} size="lg" className="mb-2">
                            Project Title
                        </Text>

                        <Text size="sm" color="dimmed" className="mb-4">
                            Lorem ipsum dolor sit amet consectetur adipisicing elit. Saepe rerum quia qui rem expedita nobis, autem id praesentium nam quaerat quo itaque assumenda. Voluptates omnis molestias reiciendis id accusamus aliquam!
                        </Text>

                        <Button variant="light" color="blue" fullWidth>
                            View Project
                        </Button>
                    </Card>
                </Grid.Col>
            </Grid>
        </div>
        
    );
}

export default Manage;